import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { Category } from '../categories/category.model';
import { InquiriesModule } from '../inquiries/inquiries.module';
import { User } from '../users/user.model';
import { Requirement } from './requirement.model';
import { RequirementsController } from './requirements.controller';
import { RequirementsService } from './requirements.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Requirement, Category, User]),
    InquiriesModule,
  ],
  controllers: [RequirementsController],
  providers: [RequirementsService],
  exports: [RequirementsService],
})
export class RequirementsModule {}
