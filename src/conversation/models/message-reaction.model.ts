import { Column, Model, ForeignKey, BelongsTo, Table, HasMany } from 'sequelize-typescript';
import { Conversation } from '../models/conversation.model';
import { User } from '../../user/models/user.model';
import { Message } from './message.model';

export type ReactionType = 'like' | 'heart';

@Table
export class MessageReaction extends Model {
  @ForeignKey(() => Message)
  @BelongsTo(() => Message, { as: 'message' })
  @Column
  messageId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @Column
  type: ReactionType;
}
