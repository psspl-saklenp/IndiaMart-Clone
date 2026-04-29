import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { BuyerProfile } from './buyer-profile.model';
import { SellerProfile } from './seller-profile.model';
import { User } from './user.model';
import { UsersService } from './users.service';

@Module({
  imports: [SequelizeModule.forFeature([User, BuyerProfile, SellerProfile])],
  providers: [UsersService],
  exports: [UsersService, SequelizeModule],
})
export class UsersModule {}
