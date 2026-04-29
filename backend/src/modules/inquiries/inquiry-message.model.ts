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
import { Inquiry } from './inquiry.model';

@Table({
  tableName: 'inquiry_messages',
  timestamps: true,
  paranoid: true,
  underscored: true,
  indexes: [{ fields: ['inquiry_id'] }, { fields: ['sender_user_id'] }],
})
export class InquiryMessage extends Model<InquiryMessage> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Inquiry)
  @AllowNull(false)
  @Column({ field: 'inquiry_id', type: DataType.UUID })
  declare inquiryId: string;

  @BelongsTo(() => Inquiry, 'inquiryId')
  declare inquiry?: Inquiry;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column({ field: 'sender_user_id', type: DataType.UUID })
  declare senderUserId: string;

  @BelongsTo(() => User, 'senderUserId')
  declare sender?: User;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare message: string;

  @AllowNull(true)
  @Column({ type: DataType.JSONB })
  declare attachments: Record<string, string>[] | null;
}
