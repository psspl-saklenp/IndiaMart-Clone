import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { type WhereOptions } from 'sequelize';

import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { buildMeta, type PaginatedResult } from '../../common/utils/pagination';
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
    if (user.role === UserRole.BUYER) (where as Record<string, unknown>).buyerId = user.id;
    else if (user.role === UserRole.SELLER) (where as Record<string, unknown>).sellerId = user.id;
    // Admin sees all — no filter applied.

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
    return {
      id: message.id,
      inquiryId: message.inquiryId,
      senderUserId: message.senderUserId,
      senderName: sender?.name ?? 'Unknown',
      senderRole: (sender?.role ?? user.role) as 'buyer' | 'seller' | 'admin',
      message: message.message,
      createdAt: message.get('createdAt') as Date,
    };
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
          include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'role'] }],
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
    return {
      ...this.toSummary(inquiry, viewer),
      message: inquiry.message,
      quantity: inquiry.quantity,
      unit: inquiry.unit,
      expectedPrice: inquiry.expectedPrice,
      messages: (inquiry.messages ?? []).map((m) => ({
        id: m.id,
        inquiryId: m.inquiryId,
        senderUserId: m.senderUserId,
        senderName: m.sender?.name ?? 'Unknown',
        senderRole: (m.sender?.role ?? 'buyer') as 'buyer' | 'seller' | 'admin',
        message: m.message,
        createdAt: m.get('createdAt') as Date,
      })),
    };
  }

  private primaryUrl(product: Product): string | null {
    const img = product.images?.find((i) => i.isPrimary) ?? product.images?.[0];
    return img?.url ?? null;
  }

}
