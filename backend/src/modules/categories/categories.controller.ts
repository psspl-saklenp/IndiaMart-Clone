import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CategoriesService } from './categories.service';
import {
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get the full category tree (public)' })
  @ApiOkResponse({ type: [CategoryResponseDto] })
  tree(): Promise<CategoryResponseDto[]> {
    return this.categoriesService.tree();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Get a category by slug (public)' })
  async bySlug(@Param('slug') slug: string): Promise<CategoryResponseDto> {
    const c = await this.categoriesService.findBySlug(slug);
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentId: c.parentId,
      iconUrl: c.iconUrl,
      position: c.position,
      description: c.description,
    };
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Create a category (admin)' })
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const c = await this.categoriesService.create(dto);
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentId: c.parentId,
      iconUrl: c.iconUrl,
      position: c.position,
      description: c.description,
    };
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category (admin)' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const c = await this.categoriesService.update(id, dto);
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentId: c.parentId,
      iconUrl: c.iconUrl,
      position: c.position,
      description: c.description,
    };
  }

  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a category (admin)' })
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
}
