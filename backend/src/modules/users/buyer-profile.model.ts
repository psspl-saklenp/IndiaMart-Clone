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
  Unique,
} from 'sequelize-typescript';

import { User } from './user.model';

@Table({
  tableName: 'buyer_profiles',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class BuyerProfile extends Model<BuyerProfile> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Unique
  @AllowNull(false)
  @Column({ field: 'user_id', type: DataType.UUID })
  declare userId: string;

  @BelongsTo(() => User)
  declare user?: User;

  @AllowNull(true)
  @Column({ field: 'company_name', type: DataType.STRING(180) })
  declare companyName: string | null;

  @AllowNull(true)
  @Column({ field: 'gst_number', type: DataType.STRING(32) })
  declare gstNumber: string | null;
}
