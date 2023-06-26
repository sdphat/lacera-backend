import { Column, Model, ForeignKey, HasOne, BelongsTo, HasMany, Table } from 'sequelize-typescript';
import { Conversation } from '../models/conversation.model';
import { User } from '../../user/models/user.model';

@Table
export class Message extends Model {
  @ForeignKey(() => User)
  senderId: number;

  @BelongsTo(() => User)
  sender: User;

  @ForeignKey(() => Conversation)
  conversationId: number;

  @BelongsTo(() => Conversation)
  conversation: Conversation;

  @Column
  content: string;

  @Column
  createdAt: Date;
}
