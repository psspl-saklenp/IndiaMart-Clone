import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { col, fn, literal, Op } from 'sequelize';

import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { buildMeta, type PaginatedResult } from '../../common/utils/pagination';
import { Product } from '../products/product.model';
import { UserRole } from '../users/enums/user-role.enum';
import { User } from '../users/user.model';
import {
  type CreateReviewDto,
  type ListReviewsQueryDto,
  type RatingBreakdownDto,
  type RatingSummaryDto,
  type ReviewResponseDto,
  type UpdateReviewDto,
} from './dto/review.dto';
import { Review } from './review.model';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectModel(Review) private readonly reviewModel: typeof Review,
    @InjectModel(Product) private readonly productModel: typeof Product,
  ) {}

  // ---- Public actions ----

  async list(query: ListReviewsQueryDto): Promise<PaginatedResult<ReviewResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const { rows, count } = await this.reviewModel.findAndCountAll({
      where: { productId: query.productId },
      include: [{ model: User, as: 'reviewer', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows.map((r) => this.toDto(r)),
      meta: buildMeta(count, page, limit),
    };
  }

  async getSummary(productId: string): Promise<RatingSummaryDto> {
    await this.findProductOrFail(productId);

    const rows = (await this.reviewModel.findAll({
      where: { productId },
      attributes: ['rating', [fn('COUNT', col('rating')), 'cnt']],
      group: ['rating'],
      raw: true,
    })) as unknown as Array<{ rating: number; cnt: string }>;

    const breakdown: RatingBreakdownDto = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let weightedSum = 0;

    for (const row of rows) {
      const cnt = parseInt(row.cnt, 10);
      breakdown[row.rating as keyof RatingBreakdownDto] = cnt;
      total += cnt;
      weightedSum += row.rating * cnt;
    }

    const average = total > 0 ? Math.round((weightedSum / total) * 10) / 10 : null;

    return { average, count: total, breakdown };
  }

  // ---- Authenticated actions ----

  async create(user: AuthenticatedUser, dto: CreateReviewDto): Promise<ReviewResponseDto> {
    const product = await this.findProductOrFail(dto.productId);

    // Sellers cannot review their own products
    if (product.sellerId === user.id) {
      throw new BadRequestException('You cannot review your own product.');
    }

    // Enforce one review per user per product
    const existing = await this.reviewModel.findOne({
      where: { productId: dto.productId, reviewerId: user.id },
    });
    if (existing) {
      throw new ConflictException('You have already reviewed this product.');
    }

    const review = await this.reviewModel.create({
      productId: dto.productId,
      reviewerId: user.id,
      rating: dto.rating,
      title: dto.title ?? null,
      body: dto.body ?? null,
      isVerified: false,
    } as Review);

    const full = await this.loadFull(review.id);
    return this.toDto(full);
  }

  async update(id: string, user: AuthenticatedUser, dto: UpdateReviewDto): Promise<ReviewResponseDto> {
    const review = await this.loadFull(id);
    this.assertAuthorOrAdmin(review, user);

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.title !== undefined) review.title = dto.title;
    if (dto.body !== undefined) review.body = dto.body;
    await review.save();

    return this.toDto(review);
  }

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    const review = await this.loadFull(id);
    this.assertAuthorOrAdmin(review, user);
    await review.destroy();
  }

  async adminToggleVerified(id: string): Promise<ReviewResponseDto> {
    const review = await this.loadFull(id);
    review.isVerified = !review.isVerified;
    await review.save();
    return this.toDto(review);
  }

  // ---- Private helpers ----

  private async findProductOrFail(productId: string): Promise<Product> {
    const product = await this.productModel.findByPk(productId);
    if (!product) throw new NotFoundException('Product not found.');
    return product;
  }

  private async loadFull(id: string): Promise<Review> {
    const review = await this.reviewModel.findByPk(id, {
      include: [{ model: User, as: 'reviewer', attributes: ['id', 'name'] }],
    });
    if (!review) throw new NotFoundException(`Review ${id} not found.`);
    return review;
  }

  private assertAuthorOrAdmin(review: Review, user: AuthenticatedUser): void {
    if (user.role === UserRole.ADMIN) return;
    if (review.reviewerId === user.id) return;
    throw new ForbiddenException('You do not have permission to modify this review.');
  }

  private toDto(review: Review): ReviewResponseDto {
    return {
      id: review.id,
      productId: review.productId,
      reviewerId: review.reviewerId,
      reviewerName: review.reviewer?.name ?? 'Anonymous',
      rating: review.rating,
      title: review.title,
      body: review.body,
      isVerified: review.isVerified,
      createdAt: review.get('createdAt') as Date,
      updatedAt: review.get('updatedAt') as Date,
    };
  }
}
