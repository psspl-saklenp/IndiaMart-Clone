import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import type { SignOptions } from 'jsonwebtoken';
import type { Transaction } from 'sequelize';
import type { Sequelize } from 'sequelize-typescript';

import type { AppConfig } from '../../config/configuration';
import { uniqueSlug } from '../../common/utils/slugify';
import { Category } from '../categories/category.model';
import { Product } from '../products/product.model';
import { SellerProfile } from '../users/seller-profile.model';
import type { User } from '../users/user.model';
import { UserRole } from '../users/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import type { LoginResponseDto, PublicUserDto, RegisterResponseDto } from './dto/auth-response.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { RegisterSellerDto, SellerSignupProductDto } from './dto/register-seller.dto';
import type { UpgradeToSellerDto } from './dto/upgrade-to-seller.dto';
import type { JwtPayload, JwtRefreshPayload } from './types/jwt-payload.interface';

const BCRYPT_ROUNDS = 12;

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
    @InjectConnection() private readonly sequelize: Sequelize,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
    @InjectModel(Product) private readonly productModel: typeof Product,
    @InjectModel(SellerProfile)
    private readonly sellerProfileModel: typeof SellerProfile,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto & { refreshToken: string }> {
    if (await this.usersService.emailExists(dto.email)) {
      throw new ConflictException('An account with that email already exists');
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.usersService.createWithProfile({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: dto.role as UserRole,
      phone: dto.phone ?? null,
      companyName: dto.companyName ?? null,
      gstNumber: dto.gstNumber ?? null,
    });

    await this.usersService.updateLastLogin(user.id);

    const tokens = await this.issueTokens(user);
    return {
      user: this.toPublicUser(user),
      accessToken: tokens.accessToken,
      expiresIn: tokens.accessExpiresIn,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Multi-step seller signup invoked from the modal in the public navbar.
   * Wraps user creation, profile creation, and the seed product list in a
   * Sequelize transaction so a partial failure rolls everything back.
   */
  async registerSeller(
    dto: RegisterSellerDto,
  ): Promise<RegisterResponseDto & { refreshToken: string }> {
    if (await this.usersService.emailExists(dto.email)) {
      throw new ConflictException('An account with that email already exists');
    }

    const passwordHash = await this.hashPassword(dto.password);

    const user = await this.sequelize.transaction(async (transaction) => {
      const created = await this.usersService.createWithProfile(
        {
          email: dto.email,
          passwordHash,
          name: dto.name,
          role: UserRole.SELLER,
          phone: dto.phone,
          companyName: dto.companyName,
          gstNumber: dto.gstNumber ?? null,
          panNumber: dto.panNumber ?? null,
          city: dto.city ?? null,
          pincode: dto.pincode ?? null,
        },
        transaction,
      );

      await this.seedSellerProducts(transaction, created.id, dto.products);

      return created;
    });

    await this.usersService.updateLastLogin(user.id);

    const tokens = await this.issueTokens(user);
    return {
      user: this.toPublicUser(user),
      accessToken: tokens.accessToken,
      expiresIn: tokens.accessExpiresIn,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Promotes an authenticated buyer to a seller. Creates the matching
   * SellerProfile, seeds the initial draft catalog, and re-issues a token
   * pair (the JWT carries the role, so the previous one is now stale).
   *
   * Wrapped in a transaction so a partial failure rolls back the role
   * change as well as profile/product creation.
   */
  async upgradeToSeller(
    userId: string,
    dto: UpgradeToSellerDto,
  ): Promise<RegisterResponseDto & { refreshToken: string }> {
    const existing = await this.usersService.findById(userId);
    if (!existing) {
      throw new NotFoundException('User not found');
    }
    if (existing.role !== UserRole.BUYER) {
      // Sellers already have a profile; admins are not consumer accounts and
      // shouldn't grow a seller profile through this endpoint.
      throw new ConflictException(
        existing.role === UserRole.SELLER
          ? 'You are already registered as a seller'
          : 'This account cannot be upgraded to a seller',
      );
    }

    const upgraded = await this.sequelize.transaction(async (transaction) => {
      // Flip the role first so the freshly-loaded user reflects the new state.
      existing.role = UserRole.SELLER;
      await existing.save({ transaction });

      // Seed the seller profile. Prefer the buyer's company name if one was
      // captured at signup, otherwise fall back to the user's own name.
      const seedName = existing.buyerProfile?.companyName ?? existing.name;
      const slug = await uniqueSlug(seedName, async (candidate) => {
        const count = await this.sellerProfileModel.count({
          where: { slug: candidate },
          transaction,
        });
        return count > 0;
      });
      await this.sellerProfileModel.create(
        {
          userId: existing.id,
          companyName: seedName,
          slug,
          gstNumber: dto.gstNumber ?? null,
          panNumber: dto.panNumber ?? null,
          city: dto.city ?? null,
          pincode: dto.pincode ?? null,
        } as SellerProfile,
        { transaction },
      );

      await this.seedSellerProducts(transaction, existing.id, dto.products);

      // Reload with profiles inside the same transaction so the returned
      // user sees the just-created seller profile.
      return this.usersService.findByIdOrFail(existing.id, transaction);
    });

    this.logger.log(`Upgraded user ${upgraded.id} from buyer to seller`);
    await this.usersService.updateLastLogin(upgraded.id);

    const tokens = await this.issueTokens(upgraded);
    return {
      user: this.toPublicUser(upgraded),
      accessToken: tokens.accessToken,
      expiresIn: tokens.accessExpiresIn,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto & { refreshToken: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      // Same error message regardless of which side fails to dodge user-enumeration.
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.usersService.updateLastLogin(user.id);

    const tokens = await this.issueTokens(user);
    return {
      user: this.toPublicUser(user),
      accessToken: tokens.accessToken,
      expiresIn: tokens.accessExpiresIn,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Rotates the refresh token: issues a new pair on every refresh.
   * Future enhancement (Phase 9): persist a refresh-token store and
   * detect/reject reuse of an already-rotated token.
   */
  async refresh(payload: JwtRefreshPayload): Promise<IssuedTokens> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return this.issueTokens(user);
  }

  toPublicUser(user: User): PublicUserDto {
    // Buyers store business details on `buyerProfile`; sellers (including
    // buyers who later upgraded) carry them on `sellerProfile`. Prefer the
    // buyer record so we keep returning the original signup values even
    // after an upgrade, falling back to the seller record when only that
    // exists (e.g. accounts that registered straight as sellers).
    const companyName =
      user.buyerProfile?.companyName ??
      user.sellerProfile?.companyName ??
      null;
    const gstNumber =
      user.buyerProfile?.gstNumber ??
      user.sellerProfile?.gstNumber ??
      null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt,
      companyName,
      gstNumber,
    };
  }

  private async issueTokens(user: User): Promise<IssuedTokens> {
    const jwtConfig = this.config.get('jwt', { infer: true });

    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const refreshPayload: JwtRefreshPayload = {
      ...accessPayload,
      tokenId: randomUUID(),
    };

    // The duration strings ('15m', '7d') are validated upstream; the cast
    // satisfies @nestjs/jwt v11's tighter `expiresIn: number | ms.StringValue` typing.
    const expiresIn = jwtConfig.expiration as SignOptions['expiresIn'];
    const refreshExpiresIn = jwtConfig.refreshExpiration as SignOptions['expiresIn'];

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: jwtConfig.secret,
      expiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      accessExpiresIn: this.toSeconds(jwtConfig.expiration),
    };
  }

  private async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
  }

  /**
   * Creates the seed product list shared by both seller signup paths
   * (`registerSeller` and `upgradeToSeller`). The signup form now asks for
   * one fully-detailed product (description, price, MOQ, unit, stock
   * status, etc.), so each row is persisted with the values supplied by
   * the user instead of placeholder defaults.
   */
  private async seedSellerProducts(
    transaction: Transaction,
    sellerId: string,
    products: SellerSignupProductDto[],
  ): Promise<void> {
    // Resolve a fallback category once so every product without an explicit
    // `categoryId` lands in the same bucket.
    const fallbackCategory = await this.resolveFallbackCategory(transaction);

    for (const item of products) {
      const categoryId = item.categoryId ?? fallbackCategory.id;
      const slug = await uniqueSlug(item.name, async (candidate) => {
        const count = await this.productModel.count({
          where: { slug: candidate },
          transaction,
        });
        return count > 0;
      });
      await this.productModel.create(
        {
          sellerId,
          categoryId,
          name: item.name,
          slug,
          description: item.description,
          specifications: item.specifications ?? null,
          price: item.price.toFixed(2),
          currency: item.currency ?? 'INR',
          minOrderQty: item.minOrderQty ?? 1,
          unit: item.unit ?? 'piece',
          stockStatus: item.stockStatus ?? 'in_stock',
          // Default to active because the seller has now provided every
          // required detail. Sellers can still toggle visibility later from
          // the seller dashboard.
          isActive: item.isActive ?? true,
        } as Product,
        { transaction },
      );
    }
  }

  /**
   * Returns the seeded `general` fallback category, creating it if missing
   * (e.g. on a fresh dev DB without the seeders run yet).
   */
  private async resolveFallbackCategory(transaction: Transaction): Promise<Category> {
    const existing = await this.categoryModel.findOne({
      where: { slug: 'general' },
      transaction,
    });
    if (existing) return existing;

    return this.categoryModel.create(
      {
        name: 'General',
        slug: 'general',
        position: 999,
      } as Category,
      { transaction },
    );
  }

  /**
   * Converts a JWT-style duration string ('15m', '1h', '7d', '60s' or a raw number of seconds)
   * to a seconds count. Used only for the `expiresIn` hint returned to clients.
   */
  toSeconds(input: string | number): number {
    if (typeof input === 'number') return input;
    const m = /^(\d+)([smhdw])?$/i.exec(input.trim());
    if (!m) return 0;
    const n = parseInt(m[1] ?? '0', 10);
    const unit = (m[2] ?? 's').toLowerCase();
    const factor: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86_400, w: 604_800 };
    return n * (factor[unit] ?? 1);
  }
}
