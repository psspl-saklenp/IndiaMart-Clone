import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Category } from '../categories/category.model';
import { Inquiry } from '../inquiries/inquiry.model';
import { Product } from '../products/product.model';
import { SellerProfile } from '../users/seller-profile.model';
import { User } from '../users/user.model';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    SequelizeModule.forFeature([User, SellerProfile, Product, Category, Inquiry]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
