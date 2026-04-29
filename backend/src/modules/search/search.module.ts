import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { CategoriesModule } from '../categories/categories.module';
import { Category } from '../categories/category.model';
import { ProductImage } from '../products/product-image.model';
import { Product } from '../products/product.model';
import { ProductsModule } from '../products/products.module';
import { SellerProfile } from '../users/seller-profile.model';
import { SellersModule } from '../sellers/sellers.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Product, ProductImage, SellerProfile, Category]),
    CategoriesModule,
    ProductsModule,
    SellersModule,
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
