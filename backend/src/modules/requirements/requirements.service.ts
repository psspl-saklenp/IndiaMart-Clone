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
import { Category } from '../categories/category.model';
import { InquiriesService } from '../inquiries/inquiries.service';
import { NotificationType } from '../notifications/enums/notification-type.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { Product } from '../products/product.model';
import { UserRole } from '../users/enums/user-role.enum';
import { User } from '../users/user.model';
import {
  type CreateRequirementDto,
  type ListRequirementsQueryDto,
  type RequirementDto,
} from './dto/requirement.dto';
import { RequirementStatus } from './enums/requirement-status.enum';
import { Requirement } from './requirement.model';

@Injectable()
export class RequirementsService {
  private readonly logger = new Logger(RequirementsService.name);

  constructor(
    @InjectModel(Requirement) private readonly requirementModel: typeof Requirement,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(Product) private readonly productModel: typeof Product,
    private readonly inquiriesService: InquiriesService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(buyer: AuthenticatedUser, dto: CreateRequirementDto): Promise<RequirementDto> {
    const category = await this.categoryModel.findByPk(dto.categoryId);
    if (!category) throw new NotFoundException('Category not found.');

    const created = await this.requirementModel.create({
      buyerId: buyer.id,
      categoryId: dto.categoryId,
      title: dto.title,
      description: dto.description,
      quantity: dto.quantity ?? null,
      unit: dto.unit ?? null,
      expectedPrice: dto.expectedPrice !== undefined ? dto.expectedPrice.toFixed(2) : null,
      locationCity: dto.locationCity ?? null,
      status: RequirementStatus.OPEN,
    } as Requirement);

    // Notify every seller that has at least one product in this category,
    // excluding the buyer themselves. Fire-and-forget — never block the response.
    void this.notifyMatchingSellers(created, buyer.id).catch((err) =>
      this.logger.warn(`notifyMatchingSellers failed: ${err}`),
    );

    return this.findById(created.id);
  }

  private async notifyMatchingSellers(req: Requirement, buyerId: string): Promise<void> {
    const products = await this.productModel.findAll({
      where: { categoryId: req.categoryId, isActive: true },
      attributes: ['sellerId'],
      group: ['sellerId'],
      raw: true,
    });

    const sellerIds = Array.from(
      new Set(
        products
          .map((p) => (p as unknown as { sellerId: string }).sellerId)
          .filter((id) => id && id !== buyerId),
      ),
    );

    await Promise.all(
      sellerIds.map((sellerId) =>
        this.notifications.notify({
          userId: sellerId,
          type: NotificationType.REQUIREMENT_MATCH,
          title: 'New requirement matches your products',
          body: req.title,
          link: `/seller/requirements`,
          data: { requirementId: req.id },
        }),
      ),
    );
  }

  async list(
    query: ListRequirementsQueryDto,
    options: { excludeBuyerId?: string } = {},
  ): Promise<PaginatedResult<RequirementDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const where: WhereOptions<Requirement> = {
      status: query.status ?? RequirementStatus.OPEN,
    };
    if (query.categoryId) (where as Record<string, unknown>).categoryId = query.categoryId;
    if (options.excludeBuyerId) {
      // Sellers viewing their leads feed shouldn't see requirements they
      // posted themselves (every user is a buyer by default in this app).
      (where as Record<string, unknown>).buyerId = {
        [Op.ne]: options.excludeBuyerId,
      };
    }

    const { rows, count } = await this.requirementModel.findAndCountAll({
      where,
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      data: rows.map((r) => this.toDto(r)),
      meta: buildMeta(count, page, limit),
    };
  }

  async listMine(buyerId: string): Promise<RequirementDto[]> {
    const rows = await this.requirementModel.findAll({
      where: { buyerId },
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return rows.map((r) => this.toDto(r));
  }

  async findById(id: string): Promise<RequirementDto> {
    const row = await this.requirementModel.findByPk(id, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      ],
    });
    if (!row) throw new NotFoundException('Requirement not found');
    return this.toDto(row);
  }

  async close(id: string, user: AuthenticatedUser): Promise<RequirementDto> {
    const row = await this.requirementModel.findByPk(id);
    if (!row) throw new NotFoundException('Requirement not found');
    if (row.buyerId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only the requirement owner (or admin) can close it.');
    }
    row.status = RequirementStatus.CLOSED;
    await row.save();
    return this.findById(row.id);
  }

  /**
   * Lets a seller "respond" to an open RFQ. Bookkeeping:
   *  - Creates a regular inquiry from the *buyer* to the *responding seller*
   *    (so the inquiry conventions + UI are reused), with the seller's
   *    intro message recorded. The seller can then continue the chat.
   *  - Bumps the requirement's response counter.
   */
  async respond(
    id: string,
    seller: AuthenticatedUser,
    message: string,
  ): Promise<{ inquiryId: string }> {
    if (seller.role !== UserRole.SELLER && seller.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only suppliers can respond to requirements.');
    }
    const trimmed = (message ?? '').trim();
    if (!trimmed) throw new BadRequestException('Message cannot be empty.');

    const row = await this.requirementModel.findByPk(id);
    if (!row) throw new NotFoundException('Requirement not found');
    if (row.status !== RequirementStatus.OPEN) {
      throw new BadRequestException('This requirement is closed.');
    }
    if (row.buyerId === seller.id) {
      throw new BadRequestException('You cannot respond to your own requirement.');
    }

    // We model the conversation as a regular inquiry so the existing
    // buyer/seller inboxes "just work". Authorship matters though: the
    // first thread message is the buyer's original requirement (so it
    // shows up under the buyer's name), and the seller's quote is added
    // as a follow-up message attributed to the seller — matching what
    // both sides actually wrote.
    const buyerCtx: AuthenticatedUser = {
      id: row.buyerId,
      email: '',
      role: UserRole.BUYER,
    };
    const inquiry = await this.inquiriesService.create(buyerCtx, {
      sellerId: seller.id,
      subject: row.title,
      message: row.description,
      ...(row.quantity ? { quantity: row.quantity } : {}),
      ...(row.unit ? { unit: row.unit } : {}),
      ...(row.expectedPrice ? { expectedPrice: Number(row.expectedPrice) } : {}),
    });

    // Now add the seller's actual quote as a second message authored by
    // the seller. This bumps the inquiry status to `responded` (see
    // InquiriesService.addMessage) and keeps message authorship truthful.
    await this.inquiriesService.addMessage(inquiry.id, seller, { message: trimmed });

    row.responseCount += 1;
    await row.save();

    return { inquiryId: inquiry.id };
  }

  private toDto(r: Requirement): RequirementDto {
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      quantity: r.quantity,
      unit: r.unit,
      expectedPrice: r.expectedPrice,
      locationCity: r.locationCity,
      responseCount: r.responseCount,
      createdAt: r.get('createdAt') as Date,
      buyer: {
        id: r.buyer?.id ?? r.buyerId,
        name: r.buyer?.name ?? 'Unknown',
      },
      category: {
        id: r.category?.id ?? r.categoryId,
        name: r.category?.name ?? '',
        slug: r.category?.slug ?? '',
      },
    };
  }
}
