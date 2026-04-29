import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import type { ProductResponseDto } from '../products/dto/product.dto';
import { SavedProductsService } from './saved-products.service';

class ToggleSaveDto {
  productId!: string;
}

@ApiTags('Saved products')
@ApiBearerAuth()
@Controller('saved-products')
@Roles(UserRole.BUYER, UserRole.ADMIN)
export class SavedProductsController {
  constructor(private readonly savedProductsService: SavedProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List the buyer\u2019s saved products' })
  list(@CurrentUser() user: AuthenticatedUser): Promise<ProductResponseDto[]> {
    return this.savedProductsService.list(user.id);
  }

  @Get('ids')
  @ApiOperation({ summary: 'List just the product ids the buyer has saved (for heart toggles)' })
  ids(@CurrentUser() user: AuthenticatedUser): Promise<string[]> {
    return this.savedProductsService.listIds(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Save a product' })
  save(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ToggleSaveDto,
  ): Promise<{ saved: true }> {
    return this.savedProductsService.save(user.id, dto.productId);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a product from the saved list' })
  unsave(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.savedProductsService.unsave(user.id, productId);
  }
}
