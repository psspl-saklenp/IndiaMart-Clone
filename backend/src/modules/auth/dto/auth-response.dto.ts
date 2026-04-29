import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '../../users/enums/user-role.enum';

export class PublicUserDto {
  @ApiProperty() id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ enum: UserRole }) role!: UserRole;
  @ApiProperty({ required: false, nullable: true }) phone!: string | null;
  @ApiProperty() isVerified!: boolean;
  @ApiProperty({ required: false, nullable: true }) lastLoginAt!: Date | null;
}

export class LoginResponseDto {
  @ApiProperty({ type: () => PublicUserDto }) user!: PublicUserDto;
  @ApiProperty({ description: 'JWT access token (in-memory storage on client).' })
  accessToken!: string;
  @ApiProperty({ description: 'Seconds until access token expires.' })
  expiresIn!: number;
}

export class RegisterResponseDto extends LoginResponseDto {}

export class RefreshResponseDto {
  @ApiProperty() accessToken!: string;
  @ApiProperty() expiresIn!: number;
}
