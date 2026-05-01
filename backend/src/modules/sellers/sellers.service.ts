import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, type WhereOptions } from 'sequelize';

import { buildMeta, type PaginatedResult } from '../../common/utils/pagination';
import { SellerProfile } from '../users/seller-profile.model';
import { User } from '../users/user.model';
import { ProductsService } from '../products/products.service';
import {
  type ListSellersQueryDto,
  type MyProfileDto,
  type SellerProfileDto,
  type SellerSummaryDto,
  type UpdateMyProfileDto,
} from './dto/seller.dto';

@Injectable()
export class SellersService {
  constructor(
    @InjectModel(SellerProfile) private readonly sellerProfileModel: typeof SellerProfile,
    private readonly productsService: ProductsService,
  ) {}

  async list(query: ListSellersQueryDto): Promise<PaginatedResult<SellerSummaryDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const where: WhereOptions<SellerProfile> = {};
    if (query.verified) (where as Record<string, unknown>).isVerifiedSupplier = true;
    if (query.q && query.q.trim()) {
      const term = `%${query.q.trim()}%`;
      (where as Record<string, unknown>)[Op.or as unknown as string] = [
        { companyName: { [Op.iLike]: term } },
      ];
    }

    const { rows, count } = await this.sellerProfileModel.findAndCountAll({
      where,
      include: [{ model: User, required: true }],
      order: [
        ['isVerifiedSupplier', 'DESC'],
        ['ratingAvg', 'DESC'],
        ['ratingCount', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit,
      offset,
    });

    return {
      data: rows.map((sp) => this.toSummary(sp)),
      meta: buildMeta(count, page, limit),
    };
  }

  async findBySlug(slug: string): Promise<SellerProfileDto> {
    const seller = await this.sellerProfileModel.findOne({
      where: { slug },
      include: [{ model: User, required: true }],
    });
    if (!seller) throw new NotFoundException(`Supplier '${slug}' not found`);

    const productsList = await this.productsService.list({
      sellerId: seller.userId,
      limit: 24,
      page: 1,
      sort: 'createdAt',
      order: 'desc',
    });

    return {
      ...this.toSummary(seller),
      bannerUrl: seller.bannerUrl,
      description: seller.description,
      productCount: productsList.meta.total,
      products: productsList.data,
    };
  }

  async findMine(userId: string): Promise<MyProfileDto> {
    const sp = await this.sellerProfileModel.findOne({ where: { userId } });
    if (!sp) {
      throw new NotFoundException(
        'You do not have a supplier profile yet. Register as a seller to create one.',
      );
    }
    return this.toMyProfile(sp);
  }

  async updateMine(userId: string, dto: UpdateMyProfileDto): Promise<MyProfileDto> {
    const sp = await this.sellerProfileModel.findOne({ where: { userId } });
    if (!sp) throw new NotFoundException('Supplier profile not found');

    Object.assign(sp, {
      companyName: dto.companyName ?? sp.companyName,
      businessType: dto.businessType ?? sp.businessType,
      establishedYear: dto.establishedYear ?? sp.establishedYear,
      description: dto.description ?? sp.description,
      gstNumber: dto.gstNumber !== undefined ? dto.gstNumber || null : sp.gstNumber,
      panNumber: dto.panNumber !== undefined ? dto.panNumber || null : sp.panNumber,
      city: dto.city !== undefined ? dto.city || null : sp.city,
      pincode: dto.pincode !== undefined ? dto.pincode || null : sp.pincode,
      logoUrl: dto.logoUrl ?? sp.logoUrl,
      bannerUrl: dto.bannerUrl ?? sp.bannerUrl,
    });
    await sp.save();

    return this.toMyProfile(sp);
  }

  private toMyProfile(sp: SellerProfile): MyProfileDto {
    return {
      id: sp.userId,
      slug: sp.slug ?? sp.userId,
      companyName: sp.companyName,
      businessType: sp.businessType,
      establishedYear: sp.establishedYear,
      description: sp.description,
      gstNumber: sp.gstNumber,
      panNumber: sp.panNumber,
      city: sp.city,
      pincode: sp.pincode,
      logoUrl: sp.logoUrl,
      bannerUrl: sp.bannerUrl,
      isVerifiedSupplier: sp.isVerifiedSupplier,
      ratingAvg: sp.ratingAvg,
      ratingCount: sp.ratingCount,
    };
  }

  private toSummary(sp: SellerProfile): SellerSummaryDto {
    const user = sp.user;
    return {
      id: sp.userId,
      slug: sp.slug ?? sp.userId,
      name: user?.name ?? sp.companyName,
      companyName: sp.companyName,
      isVerifiedSupplier: sp.isVerifiedSupplier,
      ratingAvg: sp.ratingAvg,
      ratingCount: sp.ratingCount,
      logoUrl: sp.logoUrl,
      businessType: sp.businessType,
      establishedYear: sp.establishedYear,
    };
  }
}
