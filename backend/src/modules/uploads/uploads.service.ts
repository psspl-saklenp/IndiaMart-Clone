import {
  BadRequestException,
  Injectable,
  Logger,
  type OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import type { AppConfig, AwsConfig } from '../../config/configuration';
import type {
  PresignUploadDto,
  PresignUploadResponseDto,
} from './dto/presign-upload.dto';
import type { LocalUploadResponseDto } from './dto/local-upload.dto';
import {
  ALLOWED_IMAGE_MIMES,
  LOCAL_UPLOAD_DIR,
  MAX_UPLOAD_BYTES,
  type UploadPurpose,
} from './uploads.constants';

const PRESIGN_EXPIRES_SECONDS = 60 * 5; // 5 minutes

@Injectable()
export class UploadsService implements OnModuleInit {
  private readonly logger = new Logger(UploadsService.name);
  private client: S3Client | null = null;

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  async onModuleInit(): Promise<void> {
    const dir = path.join(process.cwd(), LOCAL_UPLOAD_DIR);
    await fs.mkdir(dir, { recursive: true });
    this.logger.log(`Local upload directory ready at ${dir}`);
  }

  /**
   * Saves an uploaded file to the backend's local `uploads/` directory and
   * returns a publicly servable URL. This is the default path when AWS isn't
   * configured. Caller (controller) provides the request-derived base URL so
   * we can construct an absolute URL to persist alongside the product image.
   */
  async saveLocal(
    file: Express.Multer.File,
    userId: string,
    purpose: UploadPurpose,
    baseUrl: string,
  ): Promise<LocalUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided (expected multipart field "file")');
    }
    if (!ALLOWED_IMAGE_MIMES.has(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported content type: ${file.mimetype}. Allowed: ${[...ALLOWED_IMAGE_MIMES].join(', ')}`,
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new BadRequestException(
        `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB.`,
      );
    }

    const ext = (path.extname(file.originalname).slice(1) || 'bin').toLowerCase();
    const safeExt = /^[a-z0-9]{1,8}$/.test(ext) ? ext : 'bin';
    const filename = `${Date.now()}-${randomUUID()}.${safeExt}`;
    const relPath = `${purpose}/${userId}/${filename}`;
    const absPath = path.join(process.cwd(), LOCAL_UPLOAD_DIR, relPath);

    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, file.buffer);

    const url = `${baseUrl.replace(/\/$/, '')}/uploads/${relPath}`;
    this.logger.log(`stored ${file.size}B as ${relPath}`);

    return {
      url,
      s3Key: relPath,
      contentType: file.mimetype,
      sizeBytes: file.size,
      storage: 'local',
    };
  }

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
