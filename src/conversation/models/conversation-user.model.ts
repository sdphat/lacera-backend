import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Conversation } from './conversation.model';
import { User } from '../../user/models/user.model';

@Table
export class ConversationUser extends Model {
  @BelongsTo(() => Conversation, { as: 'conversation' })
  @ForeignKey(() => Conversation)
  @Column
  conversationId: number;

  @BelongsTo(() => User, { as: 'user' })
  @ForeignKey(() => User)
  @Column
  userId: number;
}
