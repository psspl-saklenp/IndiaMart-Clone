import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';

import { Notification } from './notification.model';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

/**
 * Marked @Global so any domain service can inject NotificationsService
 * without explicitly importing this module everywhere.
 */
@Global()
@Module({
  imports: [SequelizeModule.forFeature([Notification]), JwtModule.register({})],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
