import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class TimeseriesQueryDto {
  @ApiPropertyOptional({ minimum: 7, maximum: 90, default: 30 })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(7)
  @Max(90)
  days?: number = 30;
}

export class TopProductsQueryDto {
  @ApiPropertyOptional({ enum: ['views', 'inquiries'], default: 'views' })
  @IsOptional()
  @IsIn(['views', 'inquiries'])
  by?: 'views' | 'inquiries' = 'views';

  @ApiPropertyOptional({ minimum: 1, maximum: 20, default: 5 })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 5;
}

export class SellerStatsDto {
  @ApiProperty() totalProducts!: number;
  @ApiProperty() activeProducts!: number;
  @ApiProperty() totalViews!: number;
  @ApiProperty() totalInquiries!: number;
  @ApiProperty({ description: 'Inquiries received in the last 30 days' })
  last30dInquiries!: number;
  @ApiProperty({ description: 'Inquiries received in the prior 30 days (for delta)' })
  prev30dInquiries!: number;
  @ApiProperty({ description: 'Open inquiries (status=new)' }) openInquiries!: number;
  @ApiProperty({ description: 'Inquiries currently in responded status' })
  respondedInquiries!: number;
  @ApiProperty({ description: 'Inquiry-to-view conversion rate (0..1)' })
  conversionRate!: number;
}

export class TimeseriesPointDto {
  @ApiProperty({ description: 'YYYY-MM-DD (UTC)' }) date!: string;
  @ApiProperty() count!: number;
}

export class DashboardTopProductDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() name!: string;
  @ApiProperty() viewCount!: number;
  @ApiProperty() inquiryCount!: number;
  @ApiProperty({ required: false, nullable: true }) primaryImageUrl!: string | null;
}
