import { Column, Model, ForeignKey, BelongsTo, Table, HasMany } from 'sequelize-typescript';
import { Conversation } from '../models/conversation.model';
import { User } from '../../user/models/user.model';
import { MessageRecipient } from './message-recipient.model';

export type MessageStatus = 'received' | 'deleted';

@Table({ paranoid: true })
export class Message extends Model {
  @ForeignKey(() => User)
  senderId: number;

  @BelongsTo(() => User)
  sender: User;

  @HasMany(() => MessageRecipient)
  messageUsers: MessageRecipient[];

  @ForeignKey(() => Conversation)
  conversationId: number;

  @BelongsTo(() => Conversation)
  conversation: Conversation;

  @Column
  content: string;

  @Column
  createdAt: Date;

  @Column({
    set(_deletedAt?: Date) {
      this.setDataValue('status', 'deleted');
      this.setDataValue('deletedAt', _deletedAt);
    },
  })
  deletedAt?: Date;

  @Column({
    set(_status: MessageStatus) {
      if (this.getDataValue('deletedAt') && _status === 'deleted') {
        return;
      }
      this.setDataValue('status', _status);
    },
    defaultValue: 'received',
  })
  status: string;
}
