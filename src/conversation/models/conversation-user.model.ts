import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Conversation } from './conversation.model';
import { User } from '../../user/models/user.model';

@Table
export class ConversationUser extends Model {
  @ForeignKey(() => Conversation)
  @Column
  conversationId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;
}
