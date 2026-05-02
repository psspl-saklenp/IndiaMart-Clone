import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { UserRole } from '../../users/enums/user-role.enum';

/**
 * Public registration DTO. Admin role cannot be self-assigned —
 * `RegisterRole` enforces this at the type and runtime level.
 */
export type RegisterRole = Exclude<UserRole, UserRole.ADMIN>;
const REGISTERABLE_ROLES: RegisterRole[] = [UserRole.BUYER, UserRole.SELLER];

export class RegisterDto {
  @ApiProperty({ example: 'buyer@example.com' })
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

  @ApiProperty({ enum: REGISTERABLE_ROLES, example: UserRole.BUYER })
  @IsEnum(REGISTERABLE_ROLES, {
    message: `role must be one of: ${REGISTERABLE_ROLES.join(', ')}`,
  })
  role!: RegisterRole;

  @ApiProperty({ example: '+91 98765 43210' })
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phone!: string;

  @ApiPropertyOptional({ example: 'Acme Industries Pvt Ltd' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  companyName?: string;

  @ApiPropertyOptional({ example: '27ABCDE1234F1Z5' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  gstNumber?: string;
}
