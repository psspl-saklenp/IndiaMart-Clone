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
import { ProductsService } from './products.service';
import {
  AttachImageDto,
  CreateProductDto,
  ListProductsQueryDto,
  ProductImageResponseDto,
  ProductResponseDto,
  UpdateProductDto,
} from './dto/product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active products with filters and pagination (public)' })
  list(@Query() query: ListProductsQueryDto): Promise<PaginatedResult<ProductResponseDto>> {
    return this.productsService.list(query);
  }

  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Get('mine')
  @ApiOperation({ summary: 'List the current seller’s products' })
  mine(@CurrentUser() user: AuthenticatedUser): Promise<ProductResponseDto[]> {
    return this.productsService.listForSeller(user.id);
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a product by slug (public, increments view count)' })
  bySlug(@Param('slug') slug: string): Promise<ProductResponseDto> {
    return this.productsService.findBySlug(slug, true);
  }

  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a product (seller/admin)' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(user.id, dto);
  }

  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product (owner or admin)' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, user.id, user.role, dto);
  }

  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a product (owner or admin)' })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.productsService.remove(id, user.id, user.role);
  }

  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Post(':id/images')
  @ApiOperation({ summary: 'Attach an uploaded image to a product (owner or admin)' })
  @ApiOkResponse({ type: ProductImageResponseDto })
  async attachImage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AttachImageDto,
  ): Promise<ProductImageResponseDto> {
    const img = await this.productsService.attachImage(id, user.id, user.role, dto);
    return {
      id: img.id,
      url: img.url,
      isPrimary: img.isPrimary,
      position: img.position,
      altText: img.altText,
    };
  }

  @Roles(UserRole.SELLER, UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete(':productId/images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove an image from a product (owner or admin)' })
  detachImage(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Param('imageId', new ParseUUIDPipe()) imageId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.productsService.detachImage(productId, imageId, user.id, user.role);
  }
}
