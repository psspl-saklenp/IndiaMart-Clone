import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
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

/**
 * One product line entered in step 3 of the seller signup wizard.
 *
 * The shape intentionally mirrors a slim subset of CreateProductDto so the
 * seller can later flesh these out (description, images, stock) from the
 * seller dashboard.
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

  @ApiPropertyOptional({ description: 'Indicative unit price (defaults to 0)', example: 250 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;
}

/**
 * Captures all three steps of the seller registration modal in a single
 * payload. Every business/verification field is optional so the user can
 * defer details, but the catalog must include at least 3 products.
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

  // ---- Step 3: catalog (>= 3 product names) --------------------------------
  @ApiProperty({
    type: () => [SellerSignupProductDto],
    description: 'At least 3 products are required to seed the new supplier catalog.',
  })
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => SellerSignupProductDto)
  products!: SellerSignupProductDto[];
}
