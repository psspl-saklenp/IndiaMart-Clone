import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

import { ALLOWED_PURPOSES, type UploadPurpose } from '../uploads.constants';

export class LocalUploadFormDto {
  @ApiPropertyOptional({ enum: ALLOWED_PURPOSES, default: 'product-image' })
  @IsOptional()
  @IsIn(ALLOWED_PURPOSES as unknown as string[])
  purpose?: UploadPurpose;
}

export class LocalUploadResponseDto {
  @ApiProperty({ description: 'Public URL to display the uploaded file' })
  url!: string;

  @ApiProperty({ description: 'Storage key (relative path under /uploads)' })
  s3Key!: string;

  @ApiProperty() contentType!: string;

  @ApiProperty({ description: 'File size in bytes' }) sizeBytes!: number;

  @ApiProperty({ description: 'Storage backend that handled this upload' })
  storage!: 'local' | 's3';
}
