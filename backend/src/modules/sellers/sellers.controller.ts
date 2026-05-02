import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
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
import { SellersService } from './sellers.service';
import {
  KnownSellerDto,
  ListSellersQueryDto,
  LookupSellerQueryDto,
  MyProfileDto,
  SellerProfileDto,
  SellerSummaryDto,
  UpdateMyProfileDto,
} from './dto/seller.dto';

@ApiTags('Sellers')
@Controller('sellers')
export class SellersController {
  constructor(private readonly sellersService: SellersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List public suppliers, ordered by verified status and rating' })
  list(@Query() query: ListSellersQueryDto): Promise<PaginatedResult<SellerSummaryDto>> {
    return this.sellersService.list(query);
  }

  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Authenticated seller\'s own profile' })
  @ApiOkResponse({ type: MyProfileDto })
  me(@CurrentUser() user: AuthenticatedUser): Promise<MyProfileDto> {
    return this.sellersService.findMine(user.id);
  }

  @ApiBearerAuth()
  @Get('lookup')
  @ApiOperation({
    summary:
      'Buyer-facing "Know Your Seller" lookup by partial name/email match',
  })
  @ApiOkResponse({ type: [KnownSellerDto] })
  lookup(@Query() query: LookupSellerQueryDto): Promise<KnownSellerDto[]> {
    return this.sellersService.lookup(query.q);
  }

  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch('me')
  @ApiOperation({ summary: 'Update authenticated seller\'s profile (slug stays immutable)' })
  @ApiOkResponse({ type: MyProfileDto })
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateMyProfileDto,
  ): Promise<MyProfileDto> {
    return this.sellersService.updateMine(user.id, dto);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Public supplier profile + their active products' })
  @ApiOkResponse({ type: SellerProfileDto })
  bySlug(@Param('slug') slug: string): Promise<SellerProfileDto> {
    return this.sellersService.findBySlug(slug);
  }
}
