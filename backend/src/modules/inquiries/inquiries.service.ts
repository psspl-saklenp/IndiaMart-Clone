import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, type WhereOptions } from 'sequelize';

import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { buildMeta, type PaginatedResult } from '../../common/utils/pagination';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { ProductImage } from '../products/product-image.model';
import { Product } from '../products/product.model';
import { UserRole } from '../users/enums/user-role.enum';
import { User } from '../users/user.model';
import { InquiryMessage } from './inquiry-message.model';
import { Inquiry } from './inquiry.model';
import { InquiryStatus } from './enums/inquiry-status.enum';
import {
  type AddInquiryMessageDto,
  type CreateInquiryDto,
  type InquiryCountsDto,
  type InquiryDetailDto,
  type InquiryMessageDto,
  type InquirySummaryDto,
  type ListInquiriesQueryDto,
} from './dto/inquiry.dto';

type Side = 'buyer' | 'seller';

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);

  constructor(
    @InjectModel(Inquiry) private readonly inquiryModel: typeof Inquiry,
    @InjectModel(InquiryMessage) private readonly messageModel: typeof InquiryMessage,
    @InjectModel(Product) private readonly productModel: typeof Product,
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly notifications: NotificationsService,
  ) {}

  async create(buyer: AuthenticatedUser, dto: CreateInquiryDto): Promise<InquiryDetailDto> {
    if (buyer.id === dto.sellerId) {
      throw new BadRequestException('You cannot send an inquiry to yourself.');
    }

    const seller = await this.userModel.findByPk(dto.sellerId);
    if (!seller || seller.role !== UserRole.SELLER) {
      throw new NotFoundException('Supplier not found.');
    }

    if (dto.productId) {
      const product = await this.productModel.findByPk(dto.productId);
      if (!product) throw new NotFoundException('Product not found.');
      if (product.sellerId !== dto.sellerId) {
        throw new BadRequestException('Product does not belong to that supplier.');
      }
    }

    const inquiry = await this.inquiryModel.create({
      buyerId: buyer.id,
      sellerId: dto.sellerId,
      productId: dto.productId ?? null,
      subject: dto.subject,
      message: dto.message,
      quantity: dto.quantity ?? null,
      unit: dto.unit ?? null,
      expectedPrice: dto.expectedPrice !== undefined ? dto.expectedPrice.toFixed(2) : null,
      status: InquiryStatus.NEW,
      buyerLastReadAt: new Date(),
    } as Inquiry);

    // Mirror the initial message into inquiry_messages so the thread renders cleanly.
    await this.messageModel.create({
      inquiryId: inquiry.id,
      senderUserId: buyer.id,
      message: dto.message,
      attachments: null,
    } as InquiryMessage);

    if (dto.productId) {
      void this.productModel
        .increment('inquiryCount', { by: 1, where: { id: dto.productId } })
        .catch((err) => this.logger.warn(`inquiry_count increment failed: ${err}`));
    }

    // Fire-and-forget: notify the seller. Failure must not break the request.
    const buyerName = (await this.userModel.findByPk(buyer.id))?.name ?? 'A buyer';
    void this.notifications
      .notify({
        userId: dto.sellerId,
        type: NotificationType.NEW_INQUIRY,
        title: 'New inquiry received',
        body: `${buyerName}: ${dto.subject}`,
        link: `/seller/inquiries/${inquiry.id}`,
        data: {
          inquiryId: inquiry.id,
          actorId: buyer.id,
          actorName: buyerName,
          ...(dto.productId ? { productId: dto.productId } : {}),
        },
      })
      .catch((err) => this.logger.warn(`notify(new_inquiry) failed: ${err}`));

    return this.findById(inquiry.id, buyer);
  }

  async list(
    user: AuthenticatedUser,
    query: ListInquiriesQueryDto,
  ): Promise<PaginatedResult<InquirySummaryDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const where: WhereOptions<Inquiry> = {};

    // Filtering rules:
    //   - Admins see every inquiry (no filter applied).
    //   - Otherwise, filter by which "side" of the conversation the viewer is on.
    //     * `side=buyer`  → inquiries where buyerId  = viewer.id
    //     * `side=seller` → inquiries where sellerId = viewer.id
    //     * no `side`     → either side (buyerId OR sellerId = viewer.id)
    //   This lets a single user that is both a buyer and a seller see all
    //   their conversations on /me/inquiries (side=buyer) or only the
    //   supplier-facing ones on /seller/inquiries (side=seller).
    if (user.role !== UserRole.ADMIN) {
      if (query.side === 'buyer') {
        (where as Record<string, unknown>).buyerId = user.id;
      } else if (query.side === 'seller') {
        (where as Record<string, unknown>).sellerId = user.id;
      } else {
        (where as Record<string, unknown>)[Op.or as unknown as string] = [
          { buyerId: user.id },
          { sellerId: user.id },
        ];
      }
    }

    if (query.status) (where as Record<string, unknown>).status = query.status;

    const { rows, count } = await this.inquiryModel.findAndCountAll({
      where,
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'email'] },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug'],
          required: false,
          include: [
            {
              model: ProductImage,
              attributes: ['url', 'isPrimary', 'position'],
              required: false,
              separate: true,
              order: [['position', 'ASC']],
            },
          ],
        },
        {
          model: InquiryMessage,
          attributes: ['id', 'createdAt'],
          required: false,
          separate: true,
          order: [['createdAt', 'DESC']],
        },
      ],
      order: [['updatedAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows.map((row) => this.toSummary(row, user)),
      meta: buildMeta(count, page, limit),
    };
  }

  async findById(id: string, user: AuthenticatedUser): Promise<InquiryDetailDto> {
    const inquiry = await this.loadFull(id);
    this.assertSideOrAdmin(inquiry, user);

    // Mark this side's last-read so the unread counter stays accurate.
    const side = this.viewerSide(inquiry, user);
    if (side === 'buyer') {
      await this.inquiryModel.update(
        { buyerLastReadAt: new Date() },
        { where: { id: inquiry.id } },
      );
    } else if (side === 'seller') {
      await this.inquiryModel.update(
        { sellerLastReadAt: new Date() },
        { where: { id: inquiry.id } },
      );
    }

    return this.toDetail(inquiry, user);
  }

  async addMessage(
    id: string,
    user: AuthenticatedUser,
    dto: AddInquiryMessageDto,
  ): Promise<InquiryMessageDto> {
    const inquiry = await this.loadFull(id);
    this.assertSideOrAdmin(inquiry, user);

    if (inquiry.status === InquiryStatus.CLOSED) {
      throw new BadRequestException('This inquiry is closed.');
    }

    const message = await this.messageModel.create({
      inquiryId: inquiry.id,
      senderUserId: user.id,
      message: dto.message,
      attachments: null,
    } as InquiryMessage);

    // If the seller replies, transition the status to 'responded'.
    if (user.id === inquiry.sellerId && inquiry.status === InquiryStatus.NEW) {
      await this.inquiryModel.update(
        { status: InquiryStatus.RESPONDED, sellerLastReadAt: new Date() },
        { where: { id: inquiry.id } },
      );
    }

    // Bump the inquiry's updated_at so list ordering reflects fresh activity.
    await this.inquiryModel.update({}, { where: { id: inquiry.id }, silent: false });

    const sender = await this.userModel.findByPk(user.id);
    const senderName = sender?.name ?? 'Someone';

    // Notify the OTHER side of the conversation. Admins replying as observers
    // are rare but still useful — they notify whichever side wasn't the sender.
    const recipientId =
      user.id === inquiry.buyerId ? inquiry.sellerId : inquiry.buyerId;
    void this.notifications
      .notify({
        userId: recipientId,
        type: NotificationType.NEW_MESSAGE,
        title: 'New message',
        body: `${senderName}: ${this.preview(dto.message)}`,
        link:
          recipientId === inquiry.sellerId
            ? `/seller/inquiries/${inquiry.id}`
            : `/me/inquiries/${inquiry.id}`,
        data: {
          inquiryId: inquiry.id,
          actorId: user.id,
          actorName: senderName,
        },
      })
      .catch((err) => this.logger.warn(`notify(new_message) failed: ${err}`));

    return {
      id: message.id,
      inquiryId: message.inquiryId,
      senderUserId: message.senderUserId,
      senderName,
      senderRole: (sender?.role ?? user.role) as 'buyer' | 'seller' | 'admin',
      message: message.message,
      createdAt: message.get('createdAt') as Date,
    };
  }

  private preview(text: string, max = 80): string {
    const t = text.trim();
    return t.length > max ? `${t.slice(0, max - 1)}…` : t;
  }

  async updateStatus(
    id: string,
    user: AuthenticatedUser,
    status: InquiryStatus,
  ): Promise<InquiryDetailDto> {
    const inquiry = await this.loadFull(id);
    if (user.role !== UserRole.ADMIN && user.id !== inquiry.sellerId) {
      throw new ForbiddenException('Only the supplier (or admin) can change the inquiry status.');
    }

    inquiry.status = status;
    await inquiry.save();

    return this.findById(inquiry.id, user);
  }

  async counts(user: AuthenticatedUser): Promise<InquiryCountsDto> {
    // Unread = inquiries where the OTHER side has posted a message after this side's last read.
    const [asBuyer, asSeller] = await Promise.all([
      this.unreadCountForSide(user.id, 'buyer'),
      this.unreadCountForSide(user.id, 'seller'),
    ]);
    return { asBuyer, asSeller };
  }

  // ---- internal helpers ----
  private async unreadCountForSide(userId: string, side: Side): Promise<number> {
    // We approximate "unread" with: last-read field is null OR < updatedAt.
    const lastReadField = side === 'buyer' ? 'buyerLastReadAt' : 'sellerLastReadAt';
    const ownIdField = side === 'buyer' ? 'buyerId' : 'sellerId';

    const rows = await this.inquiryModel.findAll({
      where: { [ownIdField]: userId } as WhereOptions<Inquiry>,
      attributes: ['id', lastReadField, 'updatedAt'],
    });

    return rows.reduce((acc, r) => {
      const lastRead = r.get(lastReadField) as Date | null;
      const updated = r.get('updatedAt') as Date;
      if (!lastRead || lastRead.getTime() < updated.getTime()) return acc + 1;
      return acc;
    }, 0);
  }

  private async loadFull(id: string): Promise<Inquiry> {
    const inquiry = await this.inquiryModel.findByPk(id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'role'] },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'slug'],
          required: false,
          include: [
            {
              model: ProductImage,
              attributes: ['url', 'isPrimary', 'position'],
              required: false,
              separate: true,
              order: [['position', 'ASC']],
            },
          ],
        },
        {
          model: InquiryMessage,
          required: false,
          separate: true,
          order: [['createdAt', 'ASC']],
        },
      ],
    });
    if (!inquiry) throw new NotFoundException(`Inquiry ${id} not found`);
    return inquiry;
  }

  private assertSideOrAdmin(inquiry: Inquiry, user: AuthenticatedUser): void {
    if (user.role === UserRole.ADMIN) return;
    if (user.id === inquiry.buyerId || user.id === inquiry.sellerId) return;
    throw new ForbiddenException('You do not have access to this inquiry.');
  }

  private viewerSide(inquiry: Inquiry, user: AuthenticatedUser): Side | 'admin' {
    if (user.id === inquiry.buyerId) return 'buyer';
    if (user.id === inquiry.sellerId) return 'seller';
    return 'admin';
  }

  private toSummary(inquiry: Inquiry, viewer: AuthenticatedUser): InquirySummaryDto {
    const messages = inquiry.messages ?? [];
    const lastMessageAt =
      messages.length > 0
        ? (messages[0].get('createdAt') as Date)
        : (inquiry.get('updatedAt') as Date);

    const side = this.viewerSide(inquiry, viewer);
    const lastRead =
      side === 'buyer'
        ? inquiry.buyerLastReadAt
        : side === 'seller'
          ? inquiry.sellerLastReadAt
          : null;
    const updated = inquiry.get('updatedAt') as Date;
    const unreadForViewer = !lastRead || lastRead.getTime() < updated.getTime();

    return {
      id: inquiry.id,
      subject: inquiry.subject,
      status: inquiry.status,
      buyer: {
        id: inquiry.buyer?.id ?? inquiry.buyerId,
        name: inquiry.buyer?.name ?? 'Unknown',
        email: inquiry.buyer?.email ?? null,
      },
      seller: {
        id: inquiry.seller?.id ?? inquiry.sellerId,
        name: inquiry.seller?.name ?? 'Unknown',
        email: inquiry.seller?.email ?? null,
      },
      product: inquiry.product
        ? {
            id: inquiry.product.id,
            name: inquiry.product.name,
            slug: inquiry.product.slug,
            primaryImageUrl: this.primaryUrl(inquiry.product),
          }
        : null,
      messageCount: messages.length,
      unreadForViewer,
      lastMessageAt,
      createdAt: inquiry.get('createdAt') as Date,
    };
  }

  private toDetail(inquiry: Inquiry, viewer: AuthenticatedUser): InquiryDetailDto {
    // Build a quick lookup for sender name + role from the already-loaded
    // buyer/seller associations — avoids a nested include inside separate:true
    // (which causes Sequelize to return only the last row).
    const actorMap: Record<string, { name: string; role: 'buyer' | 'seller' | 'admin' }> = {};
    if (inquiry.buyer) {
      actorMap[inquiry.buyer.id] = { name: inquiry.buyer.name, role: 'buyer' };
    }
    if (inquiry.seller) {
      actorMap[inquiry.seller.id] = { name: inquiry.seller.name, role: 'seller' };
    }

    return {
      ...this.toSummary(inquiry, viewer),
      message: inquiry.message,
      quantity: inquiry.quantity,
      unit: inquiry.unit,
      expectedPrice: inquiry.expectedPrice,
      messages: (inquiry.messages ?? []).map((m) => {
        // Determine role from inquiry context: buyer / seller / admin fallback.
        let senderRole: 'buyer' | 'seller' | 'admin';
        if (m.senderUserId === inquiry.buyerId) {
          senderRole = 'buyer';
        } else if (m.senderUserId === inquiry.sellerId) {
          senderRole = 'seller';
        } else {
          senderRole = 'admin';
        }

        const actor = actorMap[m.senderUserId];
        return {
          id: m.id,
          inquiryId: m.inquiryId,
          senderUserId: m.senderUserId,
          senderName: actor?.name ?? 'Unknown',
          senderRole,
          message: m.message,
          createdAt: m.get('createdAt') as Date,
        };
      }),
    };
  }

  private primaryUrl(product: Product): string | null {
    const img = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
    return img?.url ?? null;
  }
}
