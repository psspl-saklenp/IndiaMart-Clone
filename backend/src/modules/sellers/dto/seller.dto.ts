import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
} from 'class-validator';

import { PaginationQueryDto } from '../../../common/utils/pagination';
import { ProductResponseDto } from '../../products/dto/product.dto';

const CURRENT_YEAR = new Date().getFullYear();

export class ListSellersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search in supplier or company name' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Only verified suppliers' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  verified?: boolean;
}

export class SellerSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false, nullable: true }) companyName!: string | null;
  @ApiProperty() isVerifiedSupplier!: boolean;
  @ApiProperty() ratingAvg!: string;
  @ApiProperty() ratingCount!: number;
  @ApiProperty({ required: false, nullable: true }) logoUrl!: string | null;
  @ApiProperty({ required: false, nullable: true }) businessType!: string | null;
  @ApiProperty({ required: false, nullable: true }) establishedYear!: number | null;
}

export class SellerProfileDto extends SellerSummaryDto {
  @ApiProperty({ required: false, nullable: true }) bannerUrl!: string | null;
  @ApiProperty({ required: false, nullable: true }) description!: string | null;
  @ApiProperty({ description: 'Active products published by this seller' })
  productCount!: number;
  @ApiProperty({ type: () => [ProductResponseDto] }) products!: ProductResponseDto[];
}

export class MyProfileDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() companyName!: string;
  @ApiProperty({ required: false, nullable: true }) businessType!: string | null;
  @ApiProperty({ required: false, nullable: true }) establishedYear!: number | null;
  @ApiProperty({ required: false, nullable: true }) description!: string | null;
  @ApiProperty({ required: false, nullable: true }) gstNumber!: string | null;
  @ApiProperty({ required: false, nullable: true }) logoUrl!: string | null;
  @ApiProperty({ required: false, nullable: true }) bannerUrl!: string | null;
  @ApiProperty() isVerifiedSupplier!: boolean;
  @ApiProperty() ratingAvg!: string;
  @ApiProperty() ratingCount!: number;
}

export class UpdateMyProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 80)
  businessType?: string;

  @ApiPropertyOptional({ minimum: 1900, example: 2010 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(CURRENT_YEAR)
  establishedYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 32)
  gstNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  bannerUrl?: string;
}
