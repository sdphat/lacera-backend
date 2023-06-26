import { Column, Table, Model, Unique, BelongsToMany } from 'sequelize-typescript';
import { Conversation } from '../../conversation/models/conversation.model';
import { ConversationUser } from '../../conversation/models/conversation-user.model';

export interface UserAttributes {
  userId: number;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  lastActive: Date;
  avatarUrl: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type CreationalUserAttributes = Omit<UserAttributes, 'userId'>;

@Table
export class User extends Model<UserAttributes, CreationalUserAttributes> {
  @Unique
  @Column
  phoneNumber: string;

  @Column
  password: string;

  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column
  lastActive: Date;

  @Column
  avatarUrl: string;

  @BelongsToMany(() => Conversation, () => ConversationUser)
  conversations: Conversation[];
}
