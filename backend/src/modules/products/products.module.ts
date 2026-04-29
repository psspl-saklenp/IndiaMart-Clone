import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { CategoriesModule } from '../categories/categories.module';
import { UsersModule } from '../users/users.module';
import { ProductImage } from './product-image.model';
import { Product } from './product.model';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Product, ProductImage]),
    CategoriesModule,
    UsersModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService, SequelizeModule],
})
export class ProductsModule {}
