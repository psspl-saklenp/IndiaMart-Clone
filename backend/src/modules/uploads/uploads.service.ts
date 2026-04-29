import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

import type { AppConfig, AwsConfig } from '../../config/configuration';
import type {
  PresignUploadDto,
  PresignUploadResponseDto,
} from './dto/presign-upload.dto';

const PRESIGN_EXPIRES_SECONDS = 60 * 5; // 5 minutes

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private client: S3Client | null = null;

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  async presign(userId: string, dto: PresignUploadDto): Promise<PresignUploadResponseDto> {
    const aws = this.config.get('aws', { infer: true });
    this.assertConfigured(aws);

    const purpose = dto.purpose ?? 'product-image';
    const ext = dto.fileName.split('.').pop()?.toLowerCase() ?? 'bin';
    const key = `${purpose}/${userId}/${Date.now()}-${randomUUID()}.${ext}`;

    const client = this.getClient(aws);
    const cmd = new PutObjectCommand({
      Bucket: aws.s3Bucket as string,
      Key: key,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(client, cmd, {
      expiresIn: PRESIGN_EXPIRES_SECONDS,
    });

    const publicBase =
      aws.s3PublicUrl?.replace(/\/$/, '') ??
      `https://${aws.s3Bucket}.s3.${aws.region}.amazonaws.com`;
    const publicUrl = `${publicBase}/${key}`;

    return {
      uploadUrl,
      publicUrl,
      s3Key: key,
      contentType: dto.contentType,
      expiresIn: PRESIGN_EXPIRES_SECONDS,
    };
  }

  // ---- helpers ----
  private getClient(aws: AwsConfig): S3Client {
    if (this.client) return this.client;
    this.client = new S3Client({
      region: aws.region,
      credentials:
        aws.accessKeyId && aws.secretAccessKey
          ? { accessKeyId: aws.accessKeyId, secretAccessKey: aws.secretAccessKey }
          : undefined, // falls back to default provider chain (IAM role, etc.)
    });
    return this.client;
  }

  private assertConfigured(aws: AwsConfig): asserts aws is AwsConfig & { s3Bucket: string } {
    if (!aws.s3Bucket) {
      this.logger.warn('Upload requested but AWS_S3_BUCKET is not configured');
      throw new ServiceUnavailableException(
        'Upload backend is not configured. Set AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in backend/.env to enable uploads.',
      );
    }
  }
}
