import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../../common/utils/pagination';
import { USER_ROLES, UserRole } from '../../users/enums/user-role.enum';

export class ListUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: USER_ROLES })
  @IsOptional()
  @IsEnum(USER_ROLES)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Search in name + email' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  verified?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ enum: USER_ROLES })
  @IsOptional()
  @IsEnum(USER_ROLES)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

export class AdminUserSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: USER_ROLES }) role!: UserRole;
  @ApiProperty() isVerified!: boolean;
  @ApiProperty({ required: false, nullable: true }) phone!: string | null;
  @ApiProperty({ required: false, nullable: true }) lastLoginAt!: Date | null;
  @ApiProperty() createdAt!: Date;
}

export class ToggleVerifiedSupplierDto {
  @ApiProperty()
  @IsBoolean()
  isVerifiedSupplier!: boolean;
}

export class ModerateProductDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean;
}

export class AdminStatsDto {
  @ApiProperty() totalUsers!: number;
  @ApiProperty() totalBuyers!: number;
  @ApiProperty() totalSellers!: number;
  @ApiProperty() totalAdmins!: number;
  @ApiProperty() verifiedSuppliers!: number;
  @ApiProperty() totalProducts!: number;
  @ApiProperty() activeProducts!: number;
  @ApiProperty() totalCategories!: number;
  @ApiProperty() totalInquiries!: number;
  @ApiProperty() openInquiries!: number;
  @ApiProperty() last30dInquiries!: number;
  @ApiProperty() last30dRegistrations!: number;
}
