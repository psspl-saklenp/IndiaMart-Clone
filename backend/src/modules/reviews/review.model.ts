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

import { Product } from '../products/product.model';
import { User } from '../users/user.model';

@Table({
  tableName: 'product_reviews',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['product_id'] },
    { fields: ['reviewer_id'] },
    { fields: ['created_at'] },
  ],
})
export class Review extends Model<Review> {
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

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ field: 'reviewer_id', type: DataType.UUID })
  declare reviewerId: string;

  @BelongsTo(() => User, 'reviewerId')
  declare reviewer?: User;

  /** 1–5 star rating enforced by a DB CHECK constraint */
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare rating: number;

  @AllowNull(true)
  @Column(DataType.STRING(120))
  declare title: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare body: string | null;

  /** Admin-toggled verified purchase badge */
  @AllowNull(false)
  @Default(false)
  @Column({ field: 'is_verified', type: DataType.BOOLEAN })
  declare isVerified: boolean;
}
