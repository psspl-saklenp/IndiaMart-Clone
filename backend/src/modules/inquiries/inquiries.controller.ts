import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
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
import type { PaginatedResult } from '../../common/utils/pagination';
import { UserRole } from '../users/enums/user-role.enum';
import { InquiriesService } from './inquiries.service';
import {
  AddInquiryMessageDto,
  CreateInquiryDto,
  InquiryCountsDto,
  InquiryDetailDto,
  InquiryMessageDto,
  InquirySummaryDto,
  ListInquiriesQueryDto,
  UpdateInquiryStatusDto,
} from './dto/inquiry.dto';

@ApiTags('Inquiries')
@ApiBearerAuth()
@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Roles(UserRole.BUYER, UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Send an inquiry to a supplier (buyer-only)' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateInquiryDto,
  ): Promise<InquiryDetailDto> {
    return this.inquiriesService.create(user, dto);
  }

  @Get('counts')
  @ApiOperation({ summary: 'Unread inquiry counts as buyer + as seller for the navbar badge' })
  @ApiOkResponse({ type: InquiryCountsDto })
  counts(@CurrentUser() user: AuthenticatedUser): Promise<InquiryCountsDto> {
    return this.inquiriesService.counts(user);
  }

  @Get()
  @ApiOperation({
    summary: 'List inquiries; role-scoped (buyer\u2192own sent, seller\u2192received, admin\u2192all)',
  })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListInquiriesQueryDto,
  ): Promise<PaginatedResult<InquirySummaryDto>> {
    return this.inquiriesService.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Inquiry detail + thread (must be a participant or admin)' })
  @ApiOkResponse({ type: InquiryDetailDto })
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InquiryDetailDto> {
    return this.inquiriesService.findById(id, user);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Reply on an inquiry thread' })
  @ApiOkResponse({ type: InquiryMessageDto })
  addMessage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddInquiryMessageDto,
  ): Promise<InquiryMessageDto> {
    return this.inquiriesService.addMessage(id, user, dto);
  }

  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update an inquiry status (supplier or admin)' })
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateInquiryStatusDto,
  ): Promise<InquiryDetailDto> {
    return this.inquiriesService.updateStatus(id, user, dto.status);
  }
}
