import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import configuration, { type AppConfig } from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './common/health/health.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { ProductsModule } from './modules/products/products.module';
import { SearchModule } from './modules/search/search.module';
import { SellerDashboardModule } from './modules/seller-dashboard/seller-dashboard.module';
import { SellersModule } from './modules/sellers/sellers.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // ---- Global app configuration ----
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
      envFilePath: ['.env.local', '.env'],
    }),
    // ---- Rate limiting (defaults; per-route overrides via @Throttle) ----
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const throttle = config.get('throttle', { infer: true });
        return [
          {
            ttl: throttle.ttl,
            limit: throttle.limit,
          },
        ];
      },
    }),
    // ---- Database (Sequelize) ----
    DatabaseModule,
    // ---- Cross-cutting modules ----
    HealthModule,
    // ---- Domain modules ----
    UsersModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    SellersModule,
    SearchModule,
    InquiriesModule,
    SellerDashboardModule,
    UploadsModule,
    AdminModule,
  ],
  providers: [
    // Global guards run in this order: throttler -> jwt -> roles.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
