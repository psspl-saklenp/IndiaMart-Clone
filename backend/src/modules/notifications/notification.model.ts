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

import { User } from '../users/user.model';
import { NotificationType } from './enums/notification-type.enum';

export interface NotificationData {
  inquiryId?: string;
  requirementId?: string;
  productId?: string;
  productSlug?: string;
  reviewId?: string;
  rating?: number;
  actorId?: string;
  actorName?: string;
}

@Table({
  tableName: 'notifications',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [
    { fields: ['user_id', 'is_read'] },
    { fields: ['user_id', 'created_at'] },
    { fields: ['type'] },
  ],
})
export class Notification extends Model<Notification> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ field: 'user_id', type: DataType.UUID })
  declare userId: string;

  @BelongsTo(() => User, 'userId')
  declare user?: User;

  @AllowNull(false)
  @Column(DataType.STRING(40))
  declare type: NotificationType;

  @AllowNull(false)
  @Column(DataType.STRING(180))
  declare title: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare body: string | null;

  @AllowNull(true)
  @Column(DataType.JSONB)
  declare data: NotificationData | null;

  @AllowNull(true)
  @Column(DataType.STRING(255))
  declare link: string | null;

  @AllowNull(false)
  @Default(false)
  @Column({ field: 'is_read', type: DataType.BOOLEAN })
  declare isRead: boolean;

  @AllowNull(true)
  @Column({ field: 'read_at', type: DataType.DATE })
  declare readAt: Date | null;
}
