import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

import { CategoryResponseDto } from '../../categories/dto/category.dto';
import {
  ProductResponseDto,
  type StockStatusValue,
} from '../../products/dto/product.dto';
import { SellerSummaryDto } from '../../sellers/dto/seller.dto';
import type { PaginatedMeta } from '../../../common/utils/pagination';

export const SEARCH_TYPES = ['all', 'products', 'suppliers', 'categories'] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

export class SearchQueryDto {
  @ApiProperty({ description: 'Search term', example: 'bearing' })
  @IsString()
  @IsNotEmpty()
  q!: string;

  @ApiPropertyOptional({ enum: SEARCH_TYPES, default: 'all' })
  @IsOptional()
  @IsIn(SEARCH_TYPES as unknown as string[])
  type?: SearchType = 'all';

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter products by stock status' })
  @IsOptional()
  @IsString()
  stockStatus?: StockStatusValue;
}

export class SuggestQueryDto {
  @ApiProperty({ description: 'Search term', example: 'bear' })
  @IsString()
  @IsNotEmpty()
  q!: string;
}

// ---- Response shapes ----

export class ProductSuggestionDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false, nullable: true }) primaryImageUrl!: string | null;
  @ApiProperty() price!: string;
  @ApiProperty() currency!: string;
}

export class SupplierSuggestionDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false, nullable: true }) companyName!: string | null;
  @ApiProperty() isVerifiedSupplier!: boolean;
}

export class CategorySuggestionDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false, nullable: true }) parentSlug!: string | null;
}

export class SuggestResponseDto {
  @ApiProperty() q!: string;
  @ApiProperty({ type: () => [ProductSuggestionDto] }) products!: ProductSuggestionDto[];
  @ApiProperty({ type: () => [SupplierSuggestionDto] }) suppliers!: SupplierSuggestionDto[];
  @ApiProperty({ type: () => [CategorySuggestionDto] }) categories!: CategorySuggestionDto[];
}

export class SearchProductsBlockDto {
  @ApiProperty({ type: () => [ProductResponseDto] }) data!: ProductResponseDto[];
  @ApiProperty() meta!: PaginatedMeta;
}

export class SearchSuppliersBlockDto {
  @ApiProperty({ type: () => [SellerSummaryDto] }) data!: SellerSummaryDto[];
  @ApiProperty() meta!: PaginatedMeta;
}

export class SearchResponseDto {
  @ApiProperty() q!: string;
  @ApiProperty({ enum: SEARCH_TYPES }) type!: SearchType;
  @ApiPropertyOptional({ type: () => SearchProductsBlockDto })
  products?: SearchProductsBlockDto;
  @ApiPropertyOptional({ type: () => SearchSuppliersBlockDto })
  suppliers?: SearchSuppliersBlockDto;
  @ApiPropertyOptional({ type: () => [CategoryResponseDto] })
  categories?: CategoryResponseDto[];
}
