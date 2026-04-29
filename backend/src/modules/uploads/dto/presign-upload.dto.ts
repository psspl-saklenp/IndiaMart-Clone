import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

const ALLOWED_PURPOSES = ['product-image', 'avatar', 'banner'] as const;
export type UploadPurpose = (typeof ALLOWED_PURPOSES)[number];

export class PresignUploadDto {
  @ApiProperty({ example: 'bearing-front.jpg' })
  @IsString()
  @MaxLength(200)
  @Matches(/^[\w\-. ()]+\.[A-Za-z0-9]{1,8}$/, {
    message: 'fileName must be a sane filename with an extension',
  })
  fileName!: string;

  @ApiProperty({ enum: ALLOWED_CONTENT_TYPES })
  @IsString()
  @IsIn(ALLOWED_CONTENT_TYPES as unknown as string[])
  contentType!: (typeof ALLOWED_CONTENT_TYPES)[number];

  @ApiPropertyOptional({ enum: ALLOWED_PURPOSES, default: 'product-image' })
  @IsOptional()
  @IsIn(ALLOWED_PURPOSES as unknown as string[])
  purpose?: UploadPurpose;
}

export class PresignUploadResponseDto {
  @ApiProperty({ description: 'PUT to this URL with the file body' })
  uploadUrl!: string;

  @ApiProperty({ description: 'Final public URL once the upload completes' })
  publicUrl!: string;

  @ApiProperty() s3Key!: string;

  @ApiProperty({ description: 'Required Content-Type header to set on the PUT' })
  contentType!: string;

  @ApiProperty({ description: 'Seconds the presigned URL is valid for' })
  expiresIn!: number;
}
