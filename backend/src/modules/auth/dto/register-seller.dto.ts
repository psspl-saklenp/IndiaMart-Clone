import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

import { STOCK_STATUSES, type StockStatusValue } from '../../products/dto/product.dto';

/**
 * One product line entered in the catalog step of the seller signup wizard.
 *
 * Mirrors the full CreateProductDto so first-time sellers can seed a
 * complete, ready-to-publish product (description, price, MOQ, unit,
 * stock status, etc.) instead of just a name placeholder.
 */
export class SellerSignupProductDto {
  @ApiProperty({ example: 'Industrial Ball Bearing 6203' })
  @IsString()
  @Length(3, 220)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @ApiPropertyOptional({
    description:
      'Optional category UUID. When omitted the seller signup falls back to the seeded `general` category.',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ description: 'Long-form product description' })
  @IsString()
  @IsNotEmpty()
  @Length(3, 5000)
  description!: string;

  @ApiPropertyOptional({
    description: 'Free-form key/value specs',
    example: { Material: 'Steel', Bore: '17mm' },
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, string>;

  @ApiProperty({ example: 250, description: 'Unit price' })
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

/**
 * Captures all three steps of the seller registration modal in a single
 * payload. Every business/verification field is optional so the user can
 * defer details, but the catalog must include at least 1 product.
 */
export class RegisterSellerDto {
  // ---- Step 1: account basics ----------------------------------------------
  @ApiProperty({ example: 'seller@example.com' })
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email!: string;

  @ApiProperty({
    description:
      'Min 8 chars; must contain at least one letter and one number to discourage trivial passwords.',
    example: 'StrongPass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Password must contain at least one letter and one number',
  })
  password!: string;

  @ApiProperty({ example: 'Acme Industries' })
  @IsString()
  @Length(2, 120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name!: string;

  @ApiProperty({ example: '+91 98765 43210' })
  @IsString()
  @Length(7, 20)
  phone!: string;

  @ApiProperty({ example: 'Acme Industries Pvt Ltd' })
  @IsString()
  @Length(2, 180)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  companyName!: string;

  @ApiPropertyOptional({ example: 'Mumbai' })
  @IsOptional()
  @IsString()
  @Length(0, 120)
  city?: string;

  @ApiPropertyOptional({ example: '400001' })
  @IsOptional()
  @IsString()
  @Length(0, 12)
  pincode?: string;

  // ---- Step 2: business & verification details -----------------------------
  @ApiPropertyOptional({ example: '27ABCDE1234F1Z5' })
  @IsOptional()
  @IsString()
  @Length(0, 32)
  gstNumber?: string;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsOptional()
  @IsString()
  @Length(0, 16)
  panNumber?: string;

  // ---- Step 3: catalog (>= 1 product) --------------------------------------
  @ApiProperty({
    type: () => [SellerSignupProductDto],
    description:
      'At least 1 fully-detailed product is required to seed the new supplier catalog.',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SellerSignupProductDto)
  products!: SellerSignupProductDto[];
}
