import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { PaginatedResult } from '../../common/utils/pagination';
import { UserRole } from '../users/enums/user-role.enum';
import {
  CreateReviewDto,
  ListReviewsQueryDto,
  RatingSummaryDto,
  ReviewResponseDto,
  UpdateReviewDto,
} from './dto/review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List reviews for a product (public, paginated)' })
  @ApiOkResponse({ type: ReviewResponseDto, isArray: true })
  list(@Query() query: ListReviewsQueryDto): Promise<PaginatedResult<ReviewResponseDto>> {
    return this.reviewsService.list(query);
  }

  @Public()
  @Get('summary')
  @ApiOperation({ summary: 'Get aggregated rating summary for a product (public)' })
  @ApiOkResponse({ type: RatingSummaryDto })
  summary(@Query('productId', new ParseUUIDPipe()) productId: string): Promise<RatingSummaryDto> {
    return this.reviewsService.getSummary(productId);
  }

  @Roles(UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a review for a product (authenticated buyer/seller)' })
  @ApiOkResponse({ type: ReviewResponseDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.create(user, dto);
  }

  @Roles(UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update own review (author or admin)' })
  @ApiOkResponse({ type: ReviewResponseDto })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.update(id, user, dto);
  }

  @Roles(UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete own review (author or admin)' })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.reviewsService.remove(id, user);
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch(':id/verify')
  @ApiOperation({ summary: 'Toggle verified badge on a review (admin only)' })
  @ApiOkResponse({ type: ReviewResponseDto })
  toggleVerified(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ReviewResponseDto> {
    return this.reviewsService.adminToggleVerified(id);
  }
}
