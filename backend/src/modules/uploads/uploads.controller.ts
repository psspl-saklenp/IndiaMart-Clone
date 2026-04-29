import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import {
  PresignUploadDto,
  PresignUploadResponseDto,
} from './dto/presign-upload.dto';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

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
}
