import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Transaction } from 'sequelize';

import { uniqueSlug } from '../../common/utils/slugify';
import { BuyerProfile } from './buyer-profile.model';
import { SellerProfile } from './seller-profile.model';
import { User } from './user.model';
import { UserRole } from './enums/user-role.enum';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  companyName?: string | null;
  gstNumber?: string | null;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(BuyerProfile) private readonly buyerProfileModel: typeof BuyerProfile,
    @InjectModel(SellerProfile) private readonly sellerProfileModel: typeof SellerProfile,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.userModel.findByPk(id, {
      include: [BuyerProfile, SellerProfile],
    });
  }

  async findByIdOrFail(id: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({
      where: { email: email.toLowerCase().trim() },
      include: [BuyerProfile, SellerProfile],
    });
  }

  /**
   * Creates a user and the matching profile (buyer/seller) in a transaction.
   * Admin users are created without a profile.
   */
  async createWithProfile(input: CreateUserInput, transaction?: Transaction): Promise<User> {
    const { companyName, gstNumber, ...userFields } = input;

    const user = await this.userModel.create(
      {
        ...userFields,
        email: userFields.email.toLowerCase().trim(),
      } as User,
      { transaction },
    );

    if (input.role === UserRole.BUYER) {
      await this.buyerProfileModel.create(
        {
          userId: user.id,
          companyName: companyName ?? null,
          gstNumber: gstNumber ?? null,
        } as BuyerProfile,
        { transaction },
      );
    } else if (input.role === UserRole.SELLER) {
      const seedName = companyName ?? input.name;
      const slug = await uniqueSlug(seedName, async (candidate) => {
        const existing = await this.sellerProfileModel.count({
          where: { slug: candidate },
          transaction,
        });
        return existing > 0;
      });
      await this.sellerProfileModel.create(
        {
          userId: user.id,
          companyName: seedName,
          slug,
          gstNumber: gstNumber ?? null,
        } as SellerProfile,
        { transaction },
      );
    }

    this.logger.log(`Created ${input.role} user ${user.id}`);
    // Reload with profiles
    return this.findByIdOrFail(user.id);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userModel.update(
      { lastLoginAt: new Date() },
      { where: { id: userId } },
    );
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.userModel.count({
      where: { email: email.toLowerCase().trim() },
    });
    return count > 0;
  }
}
