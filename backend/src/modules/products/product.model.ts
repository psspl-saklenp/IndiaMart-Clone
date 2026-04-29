import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

import { Category } from '../categories/category.model';
import { User } from '../users/user.model';
import { ProductImage } from './product-image.model';

export type StockStatus = 'in_stock' | 'out_of_stock' | 'made_to_order';

@Table({
  tableName: 'products',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['slug'] },
    { fields: ['seller_id'] },
    { fields: ['category_id'] },
    { fields: ['is_active'] },
    { fields: ['price'] },
  ],
})
export class Product extends Model<Product> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ field: 'seller_id', type: DataType.UUID })
  declare sellerId: string;

  @BelongsTo(() => User, 'sellerId')
  declare seller?: User;

  @ForeignKey(() => Category)
  @AllowNull(false)
  @Column({ field: 'category_id', type: DataType.UUID })
  declare categoryId: string;

  @BelongsTo(() => Category, 'categoryId')
  declare category?: Category;

  @AllowNull(false)
  @Column(DataType.STRING(220))
  declare name: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(260))
  declare slug: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare description: string;

  @AllowNull(true)
  @Column({ type: DataType.JSONB })
  declare specifications: Record<string, string> | null;

  @AllowNull(false)
  @Column({ type: DataType.DECIMAL(12, 2) })
  declare price: string;

  @AllowNull(false)
  @Default('INR')
  @Column(DataType.STRING(8))
  declare currency: string;

  @AllowNull(false)
  @Default(1)
  @Column({ field: 'min_order_qty', type: DataType.INTEGER })
  declare minOrderQty: number;

  @AllowNull(false)
  @Default('piece')
  @Column(DataType.STRING(32))
  declare unit: string;

  @AllowNull(false)
  @Default('in_stock')
  @Column({
    field: 'stock_status',
    type: DataType.ENUM('in_stock', 'out_of_stock', 'made_to_order'),
  })
  declare stockStatus: StockStatus;

  @AllowNull(false)
  @Default(true)
  @Column({ field: 'is_active', type: DataType.BOOLEAN })
  declare isActive: boolean;

  @AllowNull(false)
  @Default(0)
  @Column({ field: 'view_count', type: DataType.INTEGER })
  declare viewCount: number;

  @AllowNull(false)
  @Default(0)
  @Column({ field: 'inquiry_count', type: DataType.INTEGER })
  declare inquiryCount: number;

  @HasMany(() => ProductImage, 'productId')
  declare images?: ProductImage[];
}
