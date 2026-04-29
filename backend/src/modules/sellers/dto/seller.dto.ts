import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { PaginationQueryDto } from '../../../common/utils/pagination';
import { ProductResponseDto } from '../../products/dto/product.dto';

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
