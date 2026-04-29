import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ProductsModule } from '../products/products.module';
import { SellerProfile } from '../users/seller-profile.model';
import { UsersModule } from '../users/users.module';
import { SellersController } from './sellers.controller';
import { SellersService } from './sellers.service';

@Module({
  imports: [SequelizeModule.forFeature([SellerProfile]), UsersModule, ProductsModule],
  controllers: [SellersController],
  providers: [SellersService],
  exports: [SellersService],
})
export class SellersModule {}
