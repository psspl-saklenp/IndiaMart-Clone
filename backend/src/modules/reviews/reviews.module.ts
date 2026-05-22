import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Product } from '../products/product.model';
import { ProductsModule } from '../products/products.module';
import { User } from '../users/user.model';
import { UsersModule } from '../users/users.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from './review.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Review, Product, User]),
    ProductsModule,
    UsersModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
