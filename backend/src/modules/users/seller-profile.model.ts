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
  tableName: 'seller_profiles',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class SellerProfile extends Model<SellerProfile> {
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

  @AllowNull(false)
  @Column({ field: 'company_name', type: DataType.STRING(180) })
  declare companyName: string;

  @AllowNull(true)
  @Unique
  @Column({ field: 'slug', type: DataType.STRING(200) })
  declare slug: string | null;

  @AllowNull(true)
  @Column({ field: 'gst_number', type: DataType.STRING(32) })
  declare gstNumber: string | null;

  @AllowNull(true)
  @Column({ field: 'pan_number', type: DataType.STRING(16) })
  declare panNumber: string | null;

  @AllowNull(true)
  @Column({ field: 'city', type: DataType.STRING(120) })
  declare city: string | null;

  @AllowNull(true)
  @Column({ field: 'pincode', type: DataType.STRING(12) })
  declare pincode: string | null;

  @AllowNull(true)
  @Column({ field: 'established_year', type: DataType.INTEGER })
  declare establishedYear: number | null;

  @AllowNull(true)
  @Column({ field: 'business_type', type: DataType.STRING(80) })
  declare businessType: string | null;

  @AllowNull(true)
  @Column({ type: DataType.TEXT })
  declare description: string | null;

  @AllowNull(true)
  @Column({ field: 'logo_url', type: DataType.STRING(500) })
  declare logoUrl: string | null;

  @AllowNull(true)
  @Column({ field: 'banner_url', type: DataType.STRING(500) })
  declare bannerUrl: string | null;

  @AllowNull(false)
  @Default(false)
  @Column({ field: 'is_verified_supplier', type: DataType.BOOLEAN })
  declare isVerifiedSupplier: boolean;

  @AllowNull(false)
  @Default(0)
  @Column({ field: 'rating_avg', type: DataType.DECIMAL(3, 2) })
  declare ratingAvg: string;

  @AllowNull(false)
  @Default(0)
  @Column({ field: 'rating_count', type: DataType.INTEGER })
  declare ratingCount: number;
}
