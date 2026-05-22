import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EventEmitter } from 'node:events';
import { Observable, Subject, filter, map } from 'rxjs';

import { buildMeta, type PaginatedResult } from '../../common/utils/pagination';
import {
  type ListNotificationsQueryDto,
  type NotificationCountsDto,
  type NotificationDto,
} from './dto/notification.dto';
import { NotificationType } from './enums/notification-type.enum';
import { Notification, type NotificationData } from './notification.model';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  data?: NotificationData | null;
}

export interface NotificationEvent {
  userId: string;
  notification: NotificationDto;
}

/**
 * Notifications domain service.
 *
 * - Persists notifications to the DB so they survive page reloads.
 * - Pushes a live event onto a process-wide RxJS Subject; the SSE controller
 *   filters that stream per user. Single-instance only — for multi-instance
 *   deployments swap the Subject for Redis pub/sub without changing the rest.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly events$ = new Subject<NotificationEvent>();

  constructor(@InjectModel(Notification) private readonly model: typeof Notification) {
    // Node default is 10 listeners; SSE streams attach one each — bump it.
    EventEmitter.defaultMaxListeners = 100;
  }

  // ---- Emitting -------------------------------------------------------------

  /**
   * Persist + broadcast a notification. Safe to call from a hot request path:
   * we swallow errors so a failed insert never breaks the originating action.
   */
  async notify(input: CreateNotificationInput): Promise<NotificationDto | null> {
    try {
      const row = await this.model.create({
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
        data: input.data ?? null,
        isRead: false,
      } as Notification);

      const dto = this.toDto(row);
      this.events$.next({ userId: input.userId, notification: dto });
      return dto;
    } catch (err) {
      this.logger.warn(`notify failed for user ${input.userId}: ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Per-user SSE stream. Multiplexes the process-wide Subject by user id.
   */
  streamFor(userId: string): Observable<{ data: NotificationDto }> {
    return this.events$.pipe(
      filter((e) => e.userId === userId),
      map((e) => ({ data: e.notification })),
    );
  }

  // ---- Reading --------------------------------------------------------------

  async list(
    userId: string,
    query: ListNotificationsQueryDto,
  ): Promise<PaginatedResult<NotificationDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };
    if (query.unread !== undefined) where.isRead = !query.unread;
    if (query.type) where.type = query.type;

    const { rows, count } = await this.model.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      data: rows.map((r) => this.toDto(r)),
      meta: buildMeta(count, page, limit),
    };
  }

  async counts(userId: string): Promise<NotificationCountsDto> {
    const [total, unread] = await Promise.all([
      this.model.count({ where: { userId } }),
      this.model.count({ where: { userId, isRead: false } }),
    ]);
    return { total, unread };
  }

  async markRead(id: string, userId: string): Promise<NotificationDto> {
    const row = await this.model.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException('Notification not found.');
    if (!row.isRead) {
      row.isRead = true;
      row.readAt = new Date();
      await row.save();
    }
    return this.toDto(row);
  }

  async markUnread(id: string, userId: string): Promise<NotificationDto> {
    const row = await this.model.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException('Notification not found.');
    if (row.isRead) {
      row.isRead = false;
      row.readAt = null;
      await row.save();
    }
    return this.toDto(row);
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const [updated] = await this.model.update(
      { isRead: true, readAt: new Date() },
      { where: { userId, isRead: false } },
    );
    return { updated };
  }

  async remove(id: string, userId: string): Promise<void> {
    const row = await this.model.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException('Notification not found.');
    await row.destroy();
  }

  // ---- Internal -------------------------------------------------------------

  private toDto(row: Notification): NotificationDto {
    return {
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      link: row.link,
      data: row.data,
      isRead: row.isRead,
      readAt: row.readAt,
      createdAt: row.get('createdAt') as Date,
    };
  }
}
