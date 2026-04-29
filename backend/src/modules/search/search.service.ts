import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/category.model';
import { ProductImage } from '../products/product-image.model';
import { Product } from '../products/product.model';
import { ProductsService } from '../products/products.service';
import { SellerProfile } from '../users/seller-profile.model';
import { SellersService } from '../sellers/sellers.service';
import {
  type SearchQueryDto,
  type SearchResponseDto,
  type SuggestResponseDto,
} from './dto/search.dto';

const SUGGEST_LIMIT = 5;

@Injectable()
export class SearchService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly sellersService: SellersService,
    private readonly categoriesService: CategoriesService,
    @InjectModel(Product) private readonly productModel: typeof Product,
    @InjectModel(SellerProfile) private readonly sellerProfileModel: typeof SellerProfile,
    @InjectModel(Category) private readonly categoryModel: typeof Category,
  ) {}

  /**
   * Unified results page query. Honors a `type` filter so the frontend can
   * paginate within a single facet without re-fetching the others.
   */
  async search(query: SearchQueryDto): Promise<SearchResponseDto> {
    const q = query.q.trim();
    const type = query.type ?? 'all';
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const out: SearchResponseDto = { q, type };

    if (type === 'all' || type === 'products') {
      const productLimit = type === 'products' ? limit : 8;
      out.products = await this.productsService.list({
        q,
        page: type === 'products' ? page : 1,
        limit: productLimit,
        sort: 'createdAt',
        order: 'desc',
        stockStatus: query.stockStatus,
      });
    }

    if (type === 'all' || type === 'suppliers') {
      const supplierLimit = type === 'suppliers' ? limit : 8;
      out.suppliers = await this.sellersService.list({
        q,
        page: type === 'suppliers' ? page : 1,
        limit: supplierLimit,
      });
    }

    if (type === 'all' || type === 'categories') {
      const cats = await this.categoriesService.searchByName(q, type === 'categories' ? limit : 6);
      out.categories = cats.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parentId,
        iconUrl: c.iconUrl,
        position: c.position,
        description: c.description,
      }));
    }

    return out;
  }

  /**
   * Lightweight autocomplete: top 5 of each type, only the columns we need.
   */
  async suggest(qRaw: string): Promise<SuggestResponseDto> {
    const q = qRaw.trim();
    if (!q) {
      return { q, products: [], suppliers: [], categories: [] };
    }
    const term = `%${q}%`;

    const [products, suppliers, categories] = await Promise.all([
      this.productModel.findAll({
        where: { isActive: true, name: { [Op.iLike]: term } },
        attributes: ['id', 'slug', 'name', 'price', 'currency'],
        include: [
          {
            model: ProductImage,
            attributes: ['url', 'isPrimary', 'position'],
            required: false,
            separate: true,
            order: [['position', 'ASC']],
          },
        ],
        order: [['viewCount', 'DESC']],
        limit: SUGGEST_LIMIT,
      }),

      this.sellerProfileModel.findAll({
        where: { companyName: { [Op.iLike]: term } },
        attributes: ['userId', 'slug', 'companyName', 'isVerifiedSupplier'],
        include: [{ association: 'user', attributes: ['id', 'name'], required: true }],
        order: [
          ['isVerifiedSupplier', 'DESC'],
          ['ratingAvg', 'DESC'],
        ],
        limit: SUGGEST_LIMIT,
      }),

      this.categoryModel.findAll({
        where: { name: { [Op.iLike]: term } },
        attributes: ['id', 'slug', 'name', 'parentId'],
        order: [['position', 'ASC']],
        limit: SUGGEST_LIMIT,
      }),
    ]);

    // Resolve parent slugs once for the matched categories so suggestions can
    // show 'Mens Clothing in Apparel' without an N+1.
    const parentIds = Array.from(
      new Set(categories.map((c) => c.parentId).filter((p): p is string => Boolean(p))),
    );
    const parents = parentIds.length
      ? await this.categoryModel.findAll({
          where: { id: parentIds },
          attributes: ['id', 'slug'],
        })
      : [];
    const parentSlugById = new Map(parents.map((p) => [p.id, p.slug]));

    return {
      q,
      products: products.map((p) => {
        const primary = p.images?.find((i) => i.isPrimary) ?? p.images?.[0] ?? null;
        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          primaryImageUrl: primary?.url ?? null,
          price: p.price,
          currency: p.currency,
        };
      }),
      suppliers: suppliers.map((s) => ({
        id: s.userId,
        slug: s.slug ?? s.userId,
        name: s.user?.name ?? s.companyName,
        companyName: s.companyName,
        isVerifiedSupplier: s.isVerifiedSupplier,
      })),
      categories: categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        parentSlug: c.parentId ? (parentSlugById.get(c.parentId) ?? null) : null,
      })),
    };
  }
}
