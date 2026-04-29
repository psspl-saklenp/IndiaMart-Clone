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
  tableName: 'saved_products',
  timestamps: true,
  paranoid: false,
  underscored: true,
  indexes: [
    { unique: true, fields: ['buyer_id', 'product_id'], name: 'saved_products_buyer_product_uq' },
    { fields: ['buyer_id'] },
    { fields: ['product_id'] },
  ],
})
export class SavedProduct extends Model<SavedProduct> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ field: 'buyer_id', type: DataType.UUID })
  declare buyerId: string;

  @BelongsTo(() => User, 'buyerId')
  declare buyer?: User;

  @ForeignKey(() => Product)
  @AllowNull(false)
  @Column({ field: 'product_id', type: DataType.UUID })
  declare productId: string;

  @BelongsTo(() => Product, 'productId')
  declare product?: Product;
}
