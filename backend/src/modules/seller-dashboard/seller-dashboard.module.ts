import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Inquiry } from '../inquiries/inquiry.model';
import { ProductImage } from '../products/product-image.model';
import { Product } from '../products/product.model';
import { SellerDashboardController } from './seller-dashboard.controller';
import { SellerDashboardService } from './seller-dashboard.service';

@Module({
  imports: [SequelizeModule.forFeature([Product, ProductImage, Inquiry])],
  controllers: [SellerDashboardController],
  providers: [SellerDashboardService],
  exports: [SellerDashboardService],
})
export class SellerDashboardModule {}
