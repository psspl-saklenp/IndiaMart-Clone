import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import type { ProductResponseDto } from '../products/dto/product.dto';
import { ProductsService } from '../products/products.service';
import { Product } from '../products/product.model';
import { SavedProduct } from './saved-product.model';

@Injectable()
export class SavedProductsService {
  constructor(
    @InjectModel(SavedProduct) private readonly savedModel: typeof SavedProduct,
    @InjectModel(Product) private readonly productModel: typeof Product,
    private readonly productsService: ProductsService,
  ) {}

  async list(buyerId: string): Promise<ProductResponseDto[]> {
    const rows = await this.savedModel.findAll({
      where: { buyerId },
      order: [['createdAt', 'DESC']],
      attributes: ['productId', 'createdAt'],
    });
    if (rows.length === 0) return [];

    // Hydrate full product DTOs in one shot via the existing list query.
    const productIds = rows.map((r) => r.productId);
    const result = await this.productsService.list({
      page: 1,
      limit: productIds.length,
    });

    // The product list endpoint isn't keyed by id; filter client-side and preserve save order.
    const byId = new Map(result.data.map((p) => [p.id, p]));
    return productIds.map((id) => byId.get(id)).filter((p): p is ProductResponseDto => Boolean(p));
  }

  async listIds(buyerId: string): Promise<string[]> {
    const rows = await this.savedModel.findAll({
      where: { buyerId },
      attributes: ['productId'],
    });
    return rows.map((r) => r.productId);
  }

  async save(buyerId: string, productId: string): Promise<{ saved: true }> {
    const product = await this.productModel.findByPk(productId);
    if (!product) throw new NotFoundException('Product not found');

    await this.savedModel.findOrCreate({
      where: { buyerId, productId },
      defaults: { buyerId, productId } as SavedProduct,
    });
    return { saved: true };
  }

  async unsave(buyerId: string, productId: string): Promise<void> {
    await this.savedModel.destroy({ where: { buyerId, productId } });
  }
}
