import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import type { AppConfig } from '../../config/configuration';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import {
  LocalUploadFormDto,
  LocalUploadResponseDto,
} from './dto/local-upload.dto';
import {
  PresignUploadDto,
  PresignUploadResponseDto,
} from './dto/presign-upload.dto';
import { UploadsService } from './uploads.service';
import { MAX_UPLOAD_BYTES, type UploadPurpose } from './uploads.constants';

class UploadStatusDto {
  storage!: 's3' | 'local';
  maxBytes!: number;
  acceptedMimeTypes!: string[];
}

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Public()
  @Get('status')
  @ApiOperation({
    summary: 'Report which upload backend the server uses (s3 or local).',
  })
  status(): UploadStatusDto {
    const aws = this.config.get('aws', { infer: true });
    return {
      storage: aws.s3Bucket ? 's3' : 'local',
      maxBytes: MAX_UPLOAD_BYTES,
      acceptedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    };
  }

  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Post('presign')
  @ApiOperation({
    summary: 'Get a presigned PUT URL for direct-to-S3 upload',
    description:
      'Returns a 503 with guidance if AWS_S3_BUCKET is not configured. Once obtained, ' +
      'PUT the file body to `uploadUrl` with the same `Content-Type`, then attach the ' +
      'returned `publicUrl` to a product via POST /products/:id/images.',
  })
  @ApiOkResponse({ type: PresignUploadResponseDto })
  presign(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PresignUploadDto,
  ): Promise<PresignUploadResponseDto> {
    return this.uploadsService.presign(user.id, dto);
  }

  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Post('file')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Multipart upload',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        purpose: {
          type: 'string',
          enum: ['product-image', 'avatar', 'banner'],
          default: 'product-image',
        },
      },
      required: ['file'],
    },
  })
  @ApiOperation({
    summary: 'Upload a file directly to the backend (saved to local disk).',
    description:
      'For environments without AWS S3 configured. The file is stored under ' +
      'the backend\'s `uploads/` directory and served back at `/uploads/...`. ' +
      'After upload, attach the returned `url` via POST /products/:id/images.',
  })
  @ApiOkResponse({ type: LocalUploadResponseDto })
  uploadFile(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: LocalUploadFormDto,
    @Req() req: Request,
  ): Promise<LocalUploadResponseDto> {
    const purpose = (dto.purpose ?? 'product-image') as UploadPurpose;
    return this.uploadsService.saveLocal(file, user.id, purpose, this.getBaseUrl(req));
  }

  /**
   * Builds an absolute URL from the inbound request so we can persist a public
   * link to the file. Honors common reverse-proxy headers when present.
   */
  private getBaseUrl(req: Request): string {
    const overrideRaw = process.env.PUBLIC_BASE_URL;
    if (overrideRaw && overrideRaw.trim()) return overrideRaw.trim();

    const xfProto = (req.headers['x-forwarded-proto'] as string | undefined)?.split(',')[0]?.trim();
    const xfHost = (req.headers['x-forwarded-host'] as string | undefined)?.split(',')[0]?.trim();
    const protocol = xfProto || req.protocol;
    const host = xfHost || req.headers.host || 'localhost:3001';
    return `${protocol}://${host}`;
  }
}
