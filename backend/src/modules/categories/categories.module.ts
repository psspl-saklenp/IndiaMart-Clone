import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './category.model';

@Module({
  imports: [SequelizeModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService, SequelizeModule],
})
export class CategoriesModule {}
