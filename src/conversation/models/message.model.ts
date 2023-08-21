import { Column, Model, ForeignKey, BelongsTo, Table, HasMany } from 'sequelize-typescript';
import { Conversation } from '../models/conversation.model';
import { User } from '../../user/models/user.model';
import { MessageUser } from './message-recipient.model';
import { MessageReaction } from './message-reaction.model';

export type MessageStatus = 'received' | 'deleted';

@Table({ paranoid: true })
export class Message extends Model {
  @ForeignKey(() => User)
  senderId: number;

  @BelongsTo(() => User)
  sender: User;

  @HasMany(() => MessageUser)
  messageUsers: MessageUser[];

  @ForeignKey(() => Conversation)
  conversationId: number;

  @BelongsTo(() => Conversation)
  conversation: Conversation;

  @HasMany(() => MessageReaction)
  reactions: MessageReaction[];

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
