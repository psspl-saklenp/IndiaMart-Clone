import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Product } from '../products/product.model';
import { ProductsModule } from '../products/products.module';
import { SavedProduct } from './saved-product.model';
import { SavedProductsController } from './saved-products.controller';
import { SavedProductsService } from './saved-products.service';

@Module({
  imports: [SequelizeModule.forFeature([SavedProduct, Product]), ProductsModule],
  controllers: [SavedProductsController],
  providers: [SavedProductsService],
  exports: [SavedProductsService],
})
export class SavedProductsModule {}
