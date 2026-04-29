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
} from 'sequelize-typescript';

import { Product } from '../products/product.model';
import { User } from '../users/user.model';
import { InquiryMessage } from './inquiry-message.model';
import { InquiryStatus } from './enums/inquiry-status.enum';

@Table({
  tableName: 'inquiries',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['buyer_id'] },
    { fields: ['seller_id'] },
    { fields: ['product_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
  ],
})
export class Inquiry extends Model<Inquiry> {
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

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ field: 'seller_id', type: DataType.UUID })
  declare sellerId: string;

  @BelongsTo(() => User, 'sellerId')
  declare seller?: User;

  @ForeignKey(() => Product)
  @AllowNull(true)
  @Column({ field: 'product_id', type: DataType.UUID })
  declare productId: string | null;

  @BelongsTo(() => Product, 'productId')
  declare product?: Product;

  @AllowNull(false)
  @Column(DataType.STRING(220))
  declare subject: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare message: string;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare quantity: number | null;

  @AllowNull(true)
  @Column(DataType.STRING(32))
  declare unit: string | null;

  @AllowNull(true)
  @Column({ field: 'expected_price', type: DataType.DECIMAL(12, 2) })
  declare expectedPrice: string | null;

  @AllowNull(false)
  @Default(InquiryStatus.NEW)
  @Column(DataType.ENUM(...Object.values(InquiryStatus)))
  declare status: InquiryStatus;

  /**
   * The last time the buyer side viewed this inquiry. Powers unread badges
   * for the seller. nullable so legacy rows are treated as 'never read'.
   */
  @AllowNull(true)
  @Column({ field: 'buyer_last_read_at', type: DataType.DATE })
  declare buyerLastReadAt: Date | null;

  @AllowNull(true)
  @Column({ field: 'seller_last_read_at', type: DataType.DATE })
  declare sellerLastReadAt: Date | null;

  @HasMany(() => InquiryMessage, 'inquiryId')
  declare messages?: InquiryMessage[];
}
