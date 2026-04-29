import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Length,
  Max,
  Min,
} from 'class-validator';

import { PaginationQueryDto } from '../../../common/utils/pagination';

export const STOCK_STATUSES = ['in_stock', 'out_of_stock', 'made_to_order'] as const;
export type StockStatusValue = (typeof STOCK_STATUSES)[number];

export class CreateProductDto {
  @ApiProperty({ example: 'Industrial Ball Bearing 6203' })
  @IsString()
  @Length(3, 220)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ description: 'Long-form product description' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional({
    description: 'Free-form key/value specs',
    example: { Material: 'Steel', Bore: '17mm' },
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, string>;

  @ApiProperty({ example: 250 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ default: 'INR' })
  @IsOptional()
  @IsString()
  @Length(3, 8)
  currency?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minOrderQty?: number;

  @ApiPropertyOptional({ default: 'piece' })
  @IsOptional()
  @IsString()
  @Length(1, 32)
  unit?: string;

  @ApiPropertyOptional({ enum: STOCK_STATUSES, default: 'in_stock' })
  @IsOptional()
  @IsEnum(STOCK_STATUSES)
  stockStatus?: StockStatusValue;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class ListProductsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search in product name & description' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by category slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @IsNumber()
  @Min(0)
  @Max(99_999_999)
  maxPrice?: number;

  @ApiPropertyOptional({ enum: STOCK_STATUSES })
  @IsOptional()
  @IsEnum(STOCK_STATUSES)
  stockStatus?: StockStatusValue;
}

export class AttachImageDto {
  @ApiProperty({ description: 'S3 object key (or local path) returned from /uploads/presign' })
  @IsOptional()
  @IsString()
  s3Key?: string;

  @ApiProperty({ description: 'Final public URL of the uploaded image' })
  @IsUrl({ require_protocol: true, require_tld: false })
  url!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  altText?: string;
}

export class ProductImageResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() url!: string;
  @ApiProperty() isPrimary!: boolean;
  @ApiProperty() position!: number;
  @ApiProperty({ required: false, nullable: true }) altText!: string | null;
}

export class ProductSellerSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false, nullable: true }) companyName!: string | null;
  @ApiProperty() isVerifiedSupplier!: boolean;
}

export class ProductCategorySummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
}

export class ProductResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ required: false, nullable: true })
  specifications!: Record<string, string> | null;
  @ApiProperty() price!: string;
  @ApiProperty() currency!: string;
  @ApiProperty() minOrderQty!: number;
  @ApiProperty() unit!: string;
  @ApiProperty({ enum: STOCK_STATUSES }) stockStatus!: StockStatusValue;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() viewCount!: number;
  @ApiProperty() inquiryCount!: number;
  @ApiProperty({ type: () => ProductCategorySummaryDto }) category!: ProductCategorySummaryDto;
  @ApiProperty({ type: () => ProductSellerSummaryDto }) seller!: ProductSellerSummaryDto;
  @ApiProperty({ type: () => [ProductImageResponseDto] }) images!: ProductImageResponseDto[];
  @ApiProperty() createdAt!: Date;
}
