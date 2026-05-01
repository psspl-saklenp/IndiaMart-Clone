import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';

import { Category } from '../categories/category.model';
import { Product } from '../products/product.model';
import { SellerProfile } from '../users/seller-profile.model';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    // Models needed by the multi-step seller signup flow (creates the user,
    // a fallback `general` category if missing, the seed product list, and
    // — for the buyer→seller upgrade path — the seller profile row).
    SequelizeModule.forFeature([Category, Product, SellerProfile]),
    // Default JwtService config; per-call options (secret, expiresIn) are
    // overridden in AuthService.issueTokens to support distinct access vs refresh secrets.
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
