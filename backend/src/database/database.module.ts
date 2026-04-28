import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

import type { AppConfig, DatabaseConfig } from '../config/configuration';

/**
 * Picks the right database name for the current NODE_ENV.
 * Production must have DB_NAME_PRODUCTION explicitly set.
 */
function pickDatabaseName(env: AppConfig['nodeEnv'], db: DatabaseConfig): string {
  switch (env) {
    case 'production':
      if (!db.nameProduction) {
        throw new Error('DB_NAME_PRODUCTION is required when NODE_ENV=production');
      }
      return db.nameProduction;
    case 'test':
      return db.nameTest;
    case 'development':
    default:
      return db.nameDevelopment;
  }
}

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const logger = new Logger('Sequelize');
        const db = config.get('database', { infer: true });
        const nodeEnv = config.get('nodeEnv', { infer: true });

        const database = pickDatabaseName(nodeEnv, db);
        logger.log(`Connecting to ${db.dialect}://${db.host}:${db.port}/${database}`);

        return {
          dialect: db.dialect,
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database,
          autoLoadModels: true,
          // synchronize:false because we use migrations as the single source of truth.
          synchronize: false,
          logging: db.logging ? (msg: string) => logger.debug(msg) : false,
          pool: db.pool,
          define: {
            timestamps: true,
            underscored: true,
            paranoid: true,
          },
          retry: {
            max: 3,
          },
        };
      },
    }),
  ],
})
export class DatabaseModule {}
