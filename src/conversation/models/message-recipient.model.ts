import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript';
import { Message } from './message.model';
import { User } from '../../user/models/user.model';

export type MessageUserStatus = 'seen' | 'deleted';

@Table
export class MessageUser extends Model {
  @PrimaryKey
  @BelongsTo(() => Message, { as: 'message' })
  @ForeignKey(() => Message)
  @Column
  messageId: number;

  @PrimaryKey
  @BelongsTo(() => User, { as: 'recipient' })
  @ForeignKey(() => User)
  @Column
  recipientId: number;

  @Column({ defaultValue: 'seen' })
  messageStatus: MessageUserStatus;
}
