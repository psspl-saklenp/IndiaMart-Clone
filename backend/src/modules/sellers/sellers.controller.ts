import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import type { PaginatedResult } from '../../common/utils/pagination';
import { SellersService } from './sellers.service';
import {
  ListSellersQueryDto,
  SellerProfileDto,
  SellerSummaryDto,
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

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Public supplier profile + their active products' })
  @ApiOkResponse({ type: SellerProfileDto })
  bySlug(@Param('slug') slug: string): Promise<SellerProfileDto> {
    return this.sellersService.findBySlug(slug);
  }
}
