import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import {
  DashboardTopProductDto,
  SellerStatsDto,
  TimeseriesPointDto,
  TimeseriesQueryDto,
  TopProductsQueryDto,
} from './dto/dashboard.dto';
import { SellerDashboardService } from './seller-dashboard.service';

@ApiTags('Seller dashboard')
@ApiBearerAuth()
@Controller('seller-dashboard')
@Roles(UserRole.SELLER, UserRole.ADMIN)
export class SellerDashboardController {
  constructor(private readonly dashboardService: SellerDashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'KPIs for the current seller' })
  stats(@CurrentUser() user: AuthenticatedUser): Promise<SellerStatsDto> {
    return this.dashboardService.stats(user.id);
  }

  @Get('timeseries')
  @ApiOperation({ summary: 'Inquiries received per day, last N days (default 30)' })
  timeseries(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TimeseriesQueryDto,
  ): Promise<TimeseriesPointDto[]> {
    return this.dashboardService.timeseries(user.id, query.days ?? 30);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Top products by views or inquiries (limit 5 by default)' })
  topProducts(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TopProductsQueryDto,
  ): Promise<DashboardTopProductDto[]> {
    return this.dashboardService.topProducts(user.id, query.by ?? 'views', query.limit ?? 5);
  }
}
