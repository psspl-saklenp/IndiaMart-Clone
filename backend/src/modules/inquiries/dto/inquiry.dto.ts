import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

import { PaginationQueryDto } from '../../../common/utils/pagination';
import { INQUIRY_STATUSES, InquiryStatus } from '../enums/inquiry-status.enum';

export class CreateInquiryDto {
  @ApiProperty()
  @IsUUID()
  sellerId!: string;

  @ApiPropertyOptional({ description: 'Optional product the inquiry is about' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({ example: 'Quote for 100 units of bearing 6203' })
  @IsString()
  @Length(3, 220)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  subject!: string;

  @ApiProperty({ example: 'Please share best price and lead time.' })
  @IsString()
  @IsNotEmpty()
  message!: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 'piece' })
  @IsOptional()
  @IsString()
  @Length(1, 32)
  unit?: string;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  expectedPrice?: number;
}

export class AddInquiryMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class UpdateInquiryStatusDto {
  @ApiProperty({ enum: INQUIRY_STATUSES })
  @IsEnum(INQUIRY_STATUSES)
  status!: InquiryStatus;
}

export class ListInquiriesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: INQUIRY_STATUSES })
  @IsOptional()
  @IsEnum(INQUIRY_STATUSES)
  status?: InquiryStatus;
}

// ---- Response shapes ----

export class InquiryUserSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ required: false, nullable: true }) email!: string | null;
}

export class InquiryProductSummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ required: false, nullable: true }) primaryImageUrl!: string | null;
}

export class InquiryMessageDto {
  @ApiProperty() id!: string;
  @ApiProperty() inquiryId!: string;
  @ApiProperty() senderUserId!: string;
  @ApiProperty() senderName!: string;
  @ApiProperty() senderRole!: 'buyer' | 'seller' | 'admin';
  @ApiProperty() message!: string;
  @ApiProperty() createdAt!: Date;
}

export class InquirySummaryDto {
  @ApiProperty() id!: string;
  @ApiProperty() subject!: string;
  @ApiProperty({ enum: INQUIRY_STATUSES }) status!: InquiryStatus;
  @ApiProperty() buyer!: InquiryUserSummaryDto;
  @ApiProperty() seller!: InquiryUserSummaryDto;
  @ApiProperty({ required: false, nullable: true })
  product!: InquiryProductSummaryDto | null;
  @ApiProperty() messageCount!: number;
  @ApiProperty() unreadForViewer!: boolean;
  @ApiProperty() lastMessageAt!: Date;
  @ApiProperty() createdAt!: Date;
}

export class InquiryDetailDto extends InquirySummaryDto {
  @ApiProperty() message!: string;
  @ApiProperty({ required: false, nullable: true }) quantity!: number | null;
  @ApiProperty({ required: false, nullable: true }) unit!: string | null;
  @ApiProperty({ required: false, nullable: true }) expectedPrice!: string | null;
  @ApiProperty({ type: () => [InquiryMessageDto] }) messages!: InquiryMessageDto[];
}

export class InquiryCountsDto {
  @ApiProperty() asBuyer!: number;
  @ApiProperty() asSeller!: number;
}
