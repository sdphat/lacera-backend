import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Message } from './message.model';
import { User } from '../../user/models/user.model';

export type RecipientMessageStatus = 'seen' | 'deleted';

@Table
export class MessageRecipient extends Model {
  @ForeignKey(() => Message)
  @BelongsTo(() => Message, { as: 'message' })
  @Column
  messageId: number;

  @ForeignKey(() => User)
  @BelongsTo(() => User, { as: 'recipient' })
  @Column
  recipientId: number;

  @Column({ defaultValue: 'seen' })
  messageStatus: RecipientMessageStatus;
}
