import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

import { SellerSignupProductDto } from './register-seller.dto';

/**
 * Payload for upgrading an authenticated buyer into a seller.
 *
 * Compared to {@link RegisterSellerDto} this DTO intentionally omits all
 * account fields (email/password/name/phone/companyName) because the user
 * is already authenticated. The four business/verification fields below
 * mirror the fields collected by step 1 of the seller upgrade modal, and
 * the catalog (>= 1 fully-detailed product) seeds the new supplier's
 * product list.
 */
export class UpgradeToSellerDto {
  // ---- Step 1: business & verification details -----------------------------
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

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @IsOptional()
  @IsString()
  @Length(0, 16)
  panNumber?: string;

  @ApiPropertyOptional({ example: '27ABCDE1234F1Z5' })
  @IsOptional()
  @IsString()
  @Length(0, 32)
  gstNumber?: string;

  // ---- Step 2: catalog (>= 1 product) --------------------------------------
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
