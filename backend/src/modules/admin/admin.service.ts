import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, type WhereOptions } from 'sequelize';

import { buildMeta, type PaginatedResult } from '../../common/utils/pagination';
import { Category } from '../categories/category.model';
import { Inquiry } from '../inquiries/inquiry.model';
import { InquiryStatus } from '../inquiries/enums/inquiry-status.enum';
import { Product } from '../products/product.model';
import { SellerProfile } from '../users/seller-profile.model';
import { UserRole } from '../users/enums/user-role.enum';
import { User } from '../users/user.model';
import {
  type AdminStatsDto,
  type AdminUserSummaryDto,
  type ListUsersQueryDto,
  type UpdateUserDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(SellerProfile) private readonly sellerProfileModel: typeof SellerProfile,
    @InjectModel(Product) private readonly productModel: typeof Product,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(Inquiry) private readonly inquiryModel: typeof Inquiry,
  ) {}

  async listUsers(
    query: ListUsersQueryDto,
  ): Promise<PaginatedResult<AdminUserSummaryDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const where: WhereOptions<User> = {};
    if (query.role) (where as Record<string, unknown>).role = query.role;
    if (query.verified !== undefined) (where as Record<string, unknown>).isVerified = query.verified;
    if (query.q && query.q.trim()) {
      const term = `%${query.q.trim()}%`;
      (where as Record<string, unknown>)[Op.or as unknown as string] = [
        { name: { [Op.iLike]: term } },
        { email: { [Op.iLike]: term } },
      ];
    }

    const { rows, count } = await this.userModel.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      data: rows.map((u) => this.toAdminSummary(u)),
      meta: buildMeta(count, page, limit),
    };
  }

  async updateUser(
    targetId: string,
    actingAdminId: string,
    dto: UpdateUserDto,
  ): Promise<AdminUserSummaryDto> {
    const user = await this.userModel.findByPk(targetId);
    if (!user) throw new NotFoundException('User not found');

    // Guard against an admin demoting themselves and locking the system out.
    if (user.id === actingAdminId && dto.role && dto.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You cannot demote your own admin account');
    }

    if (dto.role !== undefined) user.role = dto.role;
    if (dto.isVerified !== undefined) user.isVerified = dto.isVerified;
    await user.save();

    return this.toAdminSummary(user);
  }

  async deleteUser(targetId: string, actingAdminId: string): Promise<void> {
    if (targetId === actingAdminId) {
      throw new ForbiddenException('You cannot delete your own account from the admin panel');
    }
    const user = await this.userModel.findByPk(targetId);
    if (!user) throw new NotFoundException('User not found');
    await user.destroy(); // paranoid soft delete
  }

  async setSupplierVerified(slug: string, isVerified: boolean): Promise<void> {
    const sp = await this.sellerProfileModel.findOne({ where: { slug } });
    if (!sp) throw new NotFoundException('Supplier not found');
    sp.isVerifiedSupplier = isVerified;
    await sp.save();
  }

  async moderateProduct(productId: string, isActive: boolean): Promise<void> {
    const product = await this.productModel.findByPk(productId);
    if (!product) throw new NotFoundException('Product not found');
    product.isActive = isActive;
    await product.save();
  }

  async stats(): Promise<AdminStatsDto> {
    const day = 24 * 60 * 60 * 1000;
    const last30Start = new Date(Date.now() - 30 * day);

    const [
      totalUsers,
      totalBuyers,
      totalSellers,
      totalAdmins,
      verifiedSuppliers,
      totalProducts,
      activeProducts,
      totalCategories,
      totalInquiries,
      openInquiries,
      last30dInquiries,
      last30dRegistrations,
    ] = await Promise.all([
      this.userModel.count(),
      this.userModel.count({ where: { role: UserRole.BUYER } }),
      this.userModel.count({ where: { role: UserRole.SELLER } }),
      this.userModel.count({ where: { role: UserRole.ADMIN } }),
      this.sellerProfileModel.count({ where: { isVerifiedSupplier: true } }),
      this.productModel.count(),
      this.productModel.count({ where: { isActive: true } }),
      this.categoryModel.count(),
      this.inquiryModel.count(),
      this.inquiryModel.count({ where: { status: InquiryStatus.NEW } }),
      this.inquiryModel.count({
        where: { createdAt: { [Op.gte]: last30Start } } as never,
      }),
      this.userModel.count({
        where: { createdAt: { [Op.gte]: last30Start } } as never,
      }),
    ]);

    if (totalUsers < 0) throw new BadRequestException('Stats unavailable');

    return {
      totalUsers,
      totalBuyers,
      totalSellers,
      totalAdmins,
      verifiedSuppliers,
      totalProducts,
      activeProducts,
      totalCategories,
      totalInquiries,
      openInquiries,
      last30dInquiries,
      last30dRegistrations,
    };
  }

  private toAdminSummary(u: User): AdminUserSummaryDto {
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isVerified: u.isVerified,
      phone: u.phone,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.get('createdAt') as Date,
    };
  }
}
