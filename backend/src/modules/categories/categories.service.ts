import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { uniqueSlug } from '../../common/utils/slugify';
import { Category } from './category.model';
import {
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category) private readonly categoryModel: typeof Category) {}

  /** Returns the entire category tree (top-level cats with their children inlined). */
  async tree(): Promise<CategoryResponseDto[]> {
    const all = await this.categoryModel.findAll({
      order: [
        ['position', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    const byParent = new Map<string | null, Category[]>();
    for (const cat of all) {
      const key = cat.parentId ?? null;
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key)!.push(cat);
    }

    const build = (parentId: string | null): CategoryResponseDto[] =>
      (byParent.get(parentId) ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parentId,
        iconUrl: c.iconUrl,
        position: c.position,
        description: c.description,
        children: build(c.id),
      }));

    return build(null);
  }

  async findBySlug(slug: string): Promise<Category> {
    const cat = await this.categoryModel.findOne({ where: { slug } });
    if (!cat) {
      throw new NotFoundException(`Category '${slug}' not found`);
    }
    return cat;
  }

  async findById(id: string): Promise<Category> {
    const cat = await this.categoryModel.findByPk(id);
    if (!cat) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return cat;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    if (dto.parentId) {
      // Confirm the parent exists; throws 404 otherwise.
      await this.findById(dto.parentId);
    }

    const slug = await uniqueSlug(dto.name, async (candidate) => {
      const existing = await this.categoryModel.count({ where: { slug: candidate } });
      return existing > 0;
    });

    return this.categoryModel.create({
      name: dto.name,
      slug,
      parentId: dto.parentId ?? null,
      iconUrl: dto.iconUrl ?? null,
      position: dto.position ?? 0,
      description: dto.description ?? null,
    } as Category);
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const cat = await this.findById(id);

    if (dto.parentId && dto.parentId !== cat.parentId) {
      if (dto.parentId === id) {
        throw new NotFoundException('A category cannot be its own parent');
      }
      await this.findById(dto.parentId);
    }

    Object.assign(cat, {
      name: dto.name ?? cat.name,
      parentId: dto.parentId ?? cat.parentId,
      iconUrl: dto.iconUrl ?? cat.iconUrl,
      position: dto.position ?? cat.position,
      description: dto.description ?? cat.description,
    });
    await cat.save();
    return cat;
  }

  async remove(id: string): Promise<void> {
    const cat = await this.findById(id);
    await cat.destroy();
  }

  /**
   * Lightweight text search on category name. Used by the unified search
   * endpoint to surface category links alongside product / supplier hits.
   */
  async searchByName(q: string, limit = 8): Promise<Category[]> {
    const term = `%${q.trim()}%`;
    if (!term.replaceAll('%', '')) return [];
    return this.categoryModel.findAll({
      where: { name: { [Op.iLike]: term } },
      order: [
        ['position', 'ASC'],
        ['name', 'ASC'],
      ],
      limit,
    });
  }
}
