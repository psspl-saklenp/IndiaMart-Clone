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
import { REQUIREMENT_STATUSES, RequirementStatus } from '../enums/requirement-status.enum';

export class CreateRequirementDto {
  @ApiProperty({ example: 'Need 200 industrial bearings' })
  @IsString()
  @Length(3, 220)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title!: string;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 32)
  unit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  expectedPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 120)
  locationCity?: string;
}

export class ListRequirementsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category id' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: REQUIREMENT_STATUSES, default: 'open' })
  @IsOptional()
  @IsEnum(REQUIREMENT_STATUSES)
  status?: RequirementStatus;
}

export class RequirementBuyerDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
}

export class RequirementCategoryDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
}

export class RequirementDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() description!: string;
  @ApiProperty({ enum: REQUIREMENT_STATUSES }) status!: RequirementStatus;
  @ApiProperty({ required: false, nullable: true }) quantity!: number | null;
  @ApiProperty({ required: false, nullable: true }) unit!: string | null;
  @ApiProperty({ required: false, nullable: true }) expectedPrice!: string | null;
  @ApiProperty({ required: false, nullable: true }) locationCity!: string | null;
  @ApiProperty() responseCount!: number;
  @ApiProperty() createdAt!: Date;
  @ApiProperty({ type: () => RequirementBuyerDto }) buyer!: RequirementBuyerDto;
  @ApiProperty({ type: () => RequirementCategoryDto }) category!: RequirementCategoryDto;
}
