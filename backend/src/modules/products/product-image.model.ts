import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { Product } from './product.model';

@Table({
  tableName: 'product_images',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [{ fields: ['product_id'] }],
})
export class ProductImage extends Model<ProductImage> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column({ field: 'product_id', type: DataType.UUID })
  declare productId: string;

  @BelongsTo(() => Product, 'productId')
  declare product?: Product;

  @AllowNull(true)
  @Column({ field: 's3_key', type: DataType.STRING(512) })
  declare s3Key: string | null;

  @AllowNull(false)
  @Column({ type: DataType.STRING(1024) })
  declare url: string;

  @AllowNull(false)
  @Default(false)
  @Column({ field: 'is_primary', type: DataType.BOOLEAN })
  declare isPrimary: boolean;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare position: number;

  @AllowNull(true)
  @Column({ field: 'alt_text', type: DataType.STRING(220) })
  declare altText: string | null;
}
