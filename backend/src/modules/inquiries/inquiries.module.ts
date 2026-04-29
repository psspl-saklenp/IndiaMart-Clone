import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { ProductImage } from '../products/product-image.model';
import { Product } from '../products/product.model';
import { ProductsModule } from '../products/products.module';
import { User } from '../users/user.model';
import { UsersModule } from '../users/users.module';
import { InquiriesController } from './inquiries.controller';
import { InquiriesService } from './inquiries.service';
import { InquiryMessage } from './inquiry-message.model';
import { Inquiry } from './inquiry.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Inquiry, InquiryMessage, Product, ProductImage, User]),
    UsersModule,
    ProductsModule,
  ],
  controllers: [InquiriesController],
  providers: [InquiriesService],
  exports: [InquiriesService],
})
export class InquiriesModule {}
