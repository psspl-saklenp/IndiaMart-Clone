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

import { Category } from '../categories/category.model';
import { User } from '../users/user.model';
import { RequirementStatus } from './enums/requirement-status.enum';

@Table({
  tableName: 'requirements',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['buyer_id'] },
    { fields: ['category_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
  ],
})
export class Requirement extends Model<Requirement> {
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

  @ForeignKey(() => Category)
  @AllowNull(false)
  @Column({ field: 'category_id', type: DataType.UUID })
  declare categoryId: string;

  @BelongsTo(() => Category, 'categoryId')
  declare category?: Category;

  @AllowNull(false)
  @Column(DataType.STRING(220))
  declare title: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare description: string;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare quantity: number | null;

  @AllowNull(true)
  @Column(DataType.STRING(32))
  declare unit: string | null;

  @AllowNull(true)
  @Column({ field: 'expected_price', type: DataType.DECIMAL(12, 2) })
  declare expectedPrice: string | null;

  @AllowNull(true)
  @Column({ field: 'location_city', type: DataType.STRING(120) })
  declare locationCity: string | null;

  @AllowNull(false)
  @Default(RequirementStatus.OPEN)
  @Column(DataType.ENUM(...Object.values(RequirementStatus)))
  declare status: RequirementStatus;

  @AllowNull(false)
  @Default(0)
  @Column({ field: 'response_count', type: DataType.INTEGER })
  declare responseCount: number;
}
