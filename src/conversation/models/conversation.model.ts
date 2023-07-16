import { Model, Table, BelongsToMany, HasMany, Column } from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { ConversationUser } from './conversation-user.model';
import { Message } from './message.model';

export type ConversationType = 'private' | 'group';

@Table
export class Conversation extends Model {
  @BelongsToMany(() => User, () => ConversationUser)
  participants: User[];

  @HasMany(() => ConversationUser)
  conversationUsers: ConversationUser[];

  @HasMany(() => Message)
  messages: Message[];

  @Column
  chatBackground: string;

  @Column
  type: ConversationType;

  @Column
  title: string;

  @Column
  background: string;
}

export interface ConversationAttributes {
  id: number;

  participants: User[];

  messages: Message[];

  chatBackground: string;

  type: ConversationType;
}

export interface GroupConversationAttributes extends ConversationAttributes {
  title: string;
  background: string;
  participants: [User, User];
  type: 'group';
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PrivateConversationAttributes extends ConversationAttributes {
  type: 'private';
}
