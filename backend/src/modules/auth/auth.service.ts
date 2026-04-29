import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';

import type { AppConfig } from '../../config/configuration';
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

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.expiration,
    });

    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiration,
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
