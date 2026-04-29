import {
  AllowNull,
  Column,
  DataType,
  Default,
  HasOne,
  IsEmail,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

import { UserRole } from './enums/user-role.enum';
import { BuyerProfile } from './buyer-profile.model';
import { SellerProfile } from './seller-profile.model';

@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['email'] },
    { fields: ['role'] },
  ],
})
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @IsEmail
  @Unique
  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
    set(value: string) {
      this.setDataValue('email', value.toLowerCase().trim());
    },
  })
  declare email: string;

  /** bcrypt hash; never returned over the wire (toJSON strips it). */
  @AllowNull(false)
  @Column({ field: 'password_hash', type: DataType.STRING(255) })
  declare passwordHash: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(UserRole)))
  declare role: UserRole;

  @AllowNull(false)
  @Column(DataType.STRING(120))
  declare name: string;

  @AllowNull(true)
  @Column(DataType.STRING(20))
  declare phone: string | null;

  @AllowNull(false)
  @Default(false)
  @Column({ field: 'is_verified', type: DataType.BOOLEAN })
  declare isVerified: boolean;

  @AllowNull(true)
  @Column({ field: 'last_login_at', type: DataType.DATE })
  declare lastLoginAt: Date | null;

  @HasOne(() => BuyerProfile)
  declare buyerProfile?: BuyerProfile;

  @HasOne(() => SellerProfile)
  declare sellerProfile?: SellerProfile;

  /**
   * Strips the password hash from JSON serialisations so we can't accidentally
   * leak it via API responses.
   */
  override toJSON(): Omit<ReturnType<Model['toJSON']>, 'passwordHash' | 'password_hash'> {
    const json = super.toJSON() as Record<string, unknown>;
    delete json.passwordHash;
    delete json.password_hash;
    return json;
  }
}
