import { Model, Table, BelongsToMany, HasMany, Column } from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { ConversationUser } from './conversation-user.model';
import { Message } from './message.model';

// export interface ConversationAttributes {
//   conversationId: number;
//   participants: UserAttributes[];
// }

// export type CreationalConversationAttributes = Omit<ConversationAttributes, 'conversationId'>;

@Table
export class Conversation extends Model {
  @BelongsToMany(() => User, () => ConversationUser)
  participants: User[];

  @HasMany(() => Message)
  messages: Message[];
  @Column
  title: string;
  @Column
  avatar: string;
}
