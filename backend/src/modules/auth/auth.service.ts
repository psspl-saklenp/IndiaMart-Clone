import {
  ConflictException,
  Injectable,
  Logger,
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
import type { User } from '../users/user.model';
import { UserRole } from '../users/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import type {
  LoginResponseDto,
  PublicUserDto,
  RegisterResponseDto,
} from './dto/auth-response.dto';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { RegisterSellerDto } from './dto/register-seller.dto';
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

      // Resolve a fallback category once so every product without an
      // explicit `categoryId` lands in the same bucket.
      const fallbackCategory = await this.resolveFallbackCategory(transaction);

      for (const item of dto.products) {
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
            sellerId: created.id,
            categoryId,
            name: item.name,
            slug,
            description: item.name,
            price: (item.price ?? 0).toFixed(2),
            currency: 'INR',
            minOrderQty: 1,
            unit: 'piece',
            stockStatus: 'in_stock',
            // Drafts: keep them out of the public catalog until the seller
            // edits them with real descriptions / prices.
            isActive: false,
          } as Product,
          { transaction },
        );
      }

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
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      isVerified: user.isVerified,
      lastLoginAt: user.lastLoginAt,
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
