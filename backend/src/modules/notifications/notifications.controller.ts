import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Sse,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Observable } from 'rxjs';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AppConfig } from '../../config/configuration';
import type { PaginatedResult } from '../../common/utils/pagination';
import type { JwtPayload } from '../auth/types/jwt-payload.interface';
import {
  ListNotificationsQueryDto,
  NotificationCountsDto,
  NotificationDto,
} from './dto/notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List my notifications (paginated)' })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListNotificationsQueryDto,
  ): Promise<PaginatedResult<NotificationDto>> {
    return this.notifications.list(user.id, query);
  }

  @Get('counts')
  @ApiOperation({ summary: 'Unread + total notification counts for the navbar badge' })
  @ApiOkResponse({ type: NotificationCountsDto })
  counts(@CurrentUser() user: AuthenticatedUser): Promise<NotificationCountsDto> {
    return this.notifications.counts(user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark every unread notification as read' })
  markAllRead(@CurrentUser() user: AuthenticatedUser): Promise<{ updated: number }> {
    return this.notifications.markAllRead(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markRead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationDto> {
    return this.notifications.markRead(id, user.id);
  }

  @Patch(':id/unread')
  @ApiOperation({ summary: 'Mark a notification as unread' })
  markUnread(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationDto> {
    return this.notifications.markUnread(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a notification' })
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.notifications.remove(id, user.id);
  }

  /**
   * Server-Sent Events stream.
   *
   * EventSource cannot send custom headers, so the JWT is passed as a query
   * parameter (`?token=...`). The route is marked @Public so the global
   * JwtAuthGuard does not run; we validate the token here with JwtService.
   *
   * Marked @Post-friendly? No — SSE is GET only by spec.
   */
  @Public()
  @Sse('stream')
  @ApiOperation({ summary: 'Real-time SSE stream of notifications (token in query)' })
  stream(@Query('token') token?: string): Observable<{ data: NotificationDto }> {
    if (!token) throw new UnauthorizedException('Missing token.');

    let payload: JwtPayload;
    try {
      payload = this.jwt.verify<JwtPayload>(token, {
        secret: this.config.get('jwt', { infer: true }).secret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    return this.notifications.streamFor(payload.sub);
  }
}
