import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './common/health/health.module';

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
    // ---- Database (Sequelize) ----
    DatabaseModule,
    // ---- Cross-cutting modules ----
    HealthModule,
  ],
})
export class AppModule {}
