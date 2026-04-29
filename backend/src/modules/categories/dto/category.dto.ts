import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Hand Tools' })
  @IsString()
  @Length(2, 160)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @ApiPropertyOptional({ description: 'Parent category id (omit for top-level)' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CategoryResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ required: false, nullable: true }) parentId!: string | null;
  @ApiProperty({ required: false, nullable: true }) iconUrl!: string | null;
  @ApiProperty() position!: number;
  @ApiProperty({ required: false, nullable: true }) description!: string | null;
  @ApiPropertyOptional({ type: () => [CategoryResponseDto] }) children?: CategoryResponseDto[];
}
