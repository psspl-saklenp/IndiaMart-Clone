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
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { PaginatedResult } from '../../common/utils/pagination';
import { UserRole } from '../users/enums/user-role.enum';
import { AdminService } from './admin.service';
import {
  AdminStatsDto,
  AdminUserSummaryDto,
  ListUsersQueryDto,
  ModerateProductDto,
  ToggleVerifiedSupplierDto,
  UpdateUserDto,
} from './dto/admin.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Global platform metrics for the admin dashboard' })
  stats(): Promise<AdminStatsDto> {
    return this.adminService.stats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users (filterable by role / verified / q)' })
  listUsers(
    @Query() query: ListUsersQueryDto,
  ): Promise<PaginatedResult<AdminUserSummaryDto>> {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update a user (role + verification flag)' })
  updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() admin: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): Promise<AdminUserSummaryDto> {
    return this.adminService.updateUser(id, admin.id, dto);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a user (paranoid)' })
  deleteUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ): Promise<void> {
    return this.adminService.deleteUser(id, admin.id);
  }

  @Patch('sellers/:slug/verify')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Toggle a supplier\u2019s verified flag' })
  setVerified(
    @Param('slug') slug: string,
    @Body() dto: ToggleVerifiedSupplierDto,
  ): Promise<void> {
    return this.adminService.setSupplierVerified(slug, dto.isVerifiedSupplier);
  }

  @Patch('products/:id/moderate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Toggle a product\u2019s active flag (visible/hidden)' })
  moderate(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ModerateProductDto,
  ): Promise<void> {
    return this.adminService.moderateProduct(id, dto.isActive);
  }
}
