import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, type WhereOptions } from 'sequelize';

import { buildMeta, type PaginatedResult } from '../../common/utils/pagination';
import { uniqueSlug } from '../../common/utils/slugify';
import { Category } from '../categories/category.model';
import { SellerProfile } from '../users/seller-profile.model';
import { User } from '../users/user.model';
import { UserRole } from '../users/enums/user-role.enum';
import { ProductImage } from './product-image.model';
import { Product } from './product.model';
import {
  AttachImageDto,
  CreateProductDto,
  ListProductsQueryDto,
  ProductResponseDto,
  UpdateProductDto,
} from './dto/product.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(Product) private readonly productModel: typeof Product,
    @InjectModel(ProductImage) private readonly imageModel: typeof ProductImage,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
  ) {}

  async list(query: ListProductsQueryDto): Promise<PaginatedResult<ProductResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const where: WhereOptions<Product> = { isActive: true };

    if (query.categoryId) {
      (where as Record<string, unknown>).categoryId = query.categoryId;
    } else if (query.category) {
      const cat = await this.categoryModel.findOne({ where: { slug: query.category } });
      if (cat) (where as Record<string, unknown>).categoryId = cat.id;
      else return { data: [], meta: buildMeta(0, page, limit) };
    }

    if (query.sellerId) (where as Record<string, unknown>).sellerId = query.sellerId;
    if (query.stockStatus) (where as Record<string, unknown>).stockStatus = query.stockStatus;

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const priceClause: Record<symbol, number> = {};
      if (query.minPrice !== undefined) priceClause[Op.gte] = query.minPrice;
      if (query.maxPrice !== undefined) priceClause[Op.lte] = query.maxPrice;
      (where as Record<string, unknown>).price = priceClause;
    }

    if (query.q && query.q.trim()) {
      const term = `%${query.q.trim()}%`;
      (where as Record<string, unknown>)[Op.or as unknown as string] = [
        { name: { [Op.iLike]: term } },
        { description: { [Op.iLike]: term } },
      ];
    }

    const sortField = query.sort ?? 'createdAt';
    const order: [string, 'ASC' | 'DESC'][] = [
      [sortField, (query.order ?? 'desc').toUpperCase() as 'ASC' | 'DESC'],
    ];

    const { rows, count } = await this.productModel.findAndCountAll({
      where,
      include: [
        { model: Category },
        { model: User, include: [SellerProfile] },
        { model: ProductImage, separate: true, order: [['position', 'ASC']] },
      ],
      order,
      limit,
      offset,
      distinct: true,
    });

    return {
      data: rows.map((p) => this.toResponse(p)),
      meta: buildMeta(count, page, limit),
    };
  }

  async findBySlug(slug: string, incrementView = true): Promise<ProductResponseDto> {
    const product = await this.productModel.findOne({
      where: { slug },
      include: [
        { model: Category },
        { model: User, include: [SellerProfile] },
        { model: ProductImage, separate: true, order: [['position', 'ASC']] },
      ],
    });
    if (!product) throw new NotFoundException(`Product '${slug}' not found`);

    if (incrementView) {
      // Fire-and-forget; don't fail the request if increment errors out.
      void this.productModel
        .increment('viewCount', { by: 1, where: { id: product.id } })
        .catch((err) => this.logger.warn(`view increment failed: ${err}`));
    }

    return this.toResponse(product);
  }

  async create(sellerId: string, dto: CreateProductDto): Promise<ProductResponseDto> {
    // Validate the category exists.
    const category = await this.categoryModel.findByPk(dto.categoryId);
    if (!category) throw new NotFoundException(`Category ${dto.categoryId} not found`);

    const slug = await uniqueSlug(dto.name, async (candidate) => {
      const count = await this.productModel.count({ where: { slug: candidate } });
      return count > 0;
    });

    const product = await this.productModel.create({
      sellerId,
      categoryId: dto.categoryId,
      name: dto.name,
      slug,
      description: dto.description,
      specifications: dto.specifications ?? null,
      price: dto.price.toFixed(2),
      currency: dto.currency ?? 'INR',
      minOrderQty: dto.minOrderQty ?? 1,
      unit: dto.unit ?? 'piece',
      stockStatus: dto.stockStatus ?? 'in_stock',
      isActive: dto.isActive ?? true,
    } as Product);

    return this.findBySlug(product.slug, false);
  }

  async update(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const product = await this.productModel.findByPk(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    this.assertOwnerOrAdmin(product.sellerId, requesterId, requesterRole);

    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      const cat = await this.categoryModel.findByPk(dto.categoryId);
      if (!cat) throw new NotFoundException(`Category ${dto.categoryId} not found`);
    }

    Object.assign(product, {
      name: dto.name ?? product.name,
      categoryId: dto.categoryId ?? product.categoryId,
      description: dto.description ?? product.description,
      specifications: dto.specifications ?? product.specifications,
      price: dto.price !== undefined ? dto.price.toFixed(2) : product.price,
      currency: dto.currency ?? product.currency,
      minOrderQty: dto.minOrderQty ?? product.minOrderQty,
      unit: dto.unit ?? product.unit,
      stockStatus: dto.stockStatus ?? product.stockStatus,
      isActive: dto.isActive ?? product.isActive,
    });
    await product.save();

    return this.findBySlug(product.slug, false);
  }

  async remove(id: string, requesterId: string, requesterRole: UserRole): Promise<void> {
    const product = await this.productModel.findByPk(id);
    if (!product) throw new NotFoundException(`Product ${id} not found`);

    this.assertOwnerOrAdmin(product.sellerId, requesterId, requesterRole);
    await product.destroy();
  }

  async listForSeller(sellerId: string): Promise<ProductResponseDto[]> {
    const rows = await this.productModel.findAll({
      where: { sellerId },
      include: [
        { model: Category },
        { model: User, include: [SellerProfile] },
        { model: ProductImage, separate: true, order: [['position', 'ASC']] },
      ],
      order: [['createdAt', 'DESC']],
    });
    return rows.map((p) => this.toResponse(p));
  }

  async attachImage(
    productId: string,
    requesterId: string,
    requesterRole: UserRole,
    dto: AttachImageDto,
  ): Promise<ProductImage> {
    const product = await this.productModel.findByPk(productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    this.assertOwnerOrAdmin(product.sellerId, requesterId, requesterRole);

    if (dto.isPrimary) {
      // Demote any existing primary so only one primary exists per product.
      await this.imageModel.update(
        { isPrimary: false },
        { where: { productId, isPrimary: true } },
      );
    }

    return this.imageModel.create({
      productId,
      s3Key: dto.s3Key ?? null,
      url: dto.url,
      isPrimary: dto.isPrimary ?? false,
      position: dto.position ?? 0,
      altText: dto.altText ?? null,
    } as ProductImage);
  }

  async detachImage(
    productId: string,
    imageId: string,
    requesterId: string,
    requesterRole: UserRole,
  ): Promise<void> {
    const product = await this.productModel.findByPk(productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    this.assertOwnerOrAdmin(product.sellerId, requesterId, requesterRole);

    const image = await this.imageModel.findOne({ where: { id: imageId, productId } });
    if (!image) throw new NotFoundException(`Image ${imageId} not found on this product`);

    await image.destroy();
  }

  // ---- helpers ----
  private assertOwnerOrAdmin(
    ownerId: string,
    requesterId: string,
    requesterRole: UserRole,
  ): void {
    if (requesterRole === UserRole.ADMIN) return;
    if (ownerId !== requesterId) {
      throw new ForbiddenException('You do not have permission to modify this product');
    }
  }

  private toResponse(p: Product): ProductResponseDto {
    const seller = p.seller;
    const category = p.category;
    const sellerSummary = {
      id: seller?.id ?? p.sellerId,
      slug: seller?.sellerProfile?.slug ?? null,
      name: seller?.name ?? 'Unknown supplier',
      companyName: seller?.sellerProfile?.companyName ?? null,
      isVerifiedSupplier: seller?.sellerProfile?.isVerifiedSupplier ?? false,
    };
    const categorySummary = {
      id: category?.id ?? p.categoryId,
      name: category?.name ?? 'Uncategorised',
      slug: category?.slug ?? '',
    };
    const images = (p.images ?? []).map((img) => ({
      id: img.id,
      url: img.url,
      isPrimary: img.isPrimary,
      position: img.position,
      altText: img.altText,
    }));
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      specifications: p.specifications,
      price: p.price,
      currency: p.currency,
      minOrderQty: p.minOrderQty,
      unit: p.unit,
      stockStatus: p.stockStatus,
      isActive: p.isActive,
      viewCount: p.viewCount,
      inquiryCount: p.inquiryCount,
      category: categorySummary,
      seller: sellerSummary,
      images,
      createdAt: p.get('createdAt') as Date,
    };
  }
}
