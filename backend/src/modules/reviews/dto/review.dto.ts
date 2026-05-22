import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';

import { PaginationQueryDto } from '../../../common/utils/pagination';

// ---- Request DTOs ----

export class CreateReviewDto {
  @ApiProperty({ description: 'ID of the product being reviewed' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 4 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: 'Great quality product!' })
  @IsOptional()
  @IsString()
  @Length(3, 120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title?: string;

  @ApiPropertyOptional({ example: 'Arrived on time, well packaged, exactly as described.' })
  @IsOptional()
  @IsString()
  @Length(1, 5000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  body?: string;
}

export class UpdateReviewDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 5000)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  body?: string;
}

export class ListReviewsQueryDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Product ID to fetch reviews for' })
  @IsUUID()
  productId!: string;
}

// ---- Response DTOs ----

export class ReviewResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() productId!: string;
  @ApiProperty() reviewerId!: string;
  @ApiProperty() reviewerName!: string;
  @ApiProperty({ minimum: 1, maximum: 5 }) rating!: number;
  @ApiProperty({ required: false, nullable: true }) title!: string | null;
  @ApiProperty({ required: false, nullable: true }) body!: string | null;
  @ApiProperty() isVerified!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}

export class RatingBreakdownDto {
  @ApiProperty() 1!: number;
  @ApiProperty() 2!: number;
  @ApiProperty() 3!: number;
  @ApiProperty() 4!: number;
  @ApiProperty() 5!: number;
}

export class RatingSummaryDto {
  @ApiProperty({ type: Number, nullable: true }) average!: number | null;
  @ApiProperty() count!: number;
  @ApiProperty({ type: () => RatingBreakdownDto }) breakdown!: RatingBreakdownDto;
}
