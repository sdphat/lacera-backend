import { Column, Table, Model, Unique, BelongsToMany, HasMany } from 'sequelize-typescript';
import { Conversation } from '../../conversation/models/conversation.model';
import { ConversationUser } from '../../conversation/models/conversation-user.model';
import { Friend } from './friend.model';
import { MessageRecipient } from '../../conversation/models/message-recipient.model';

export interface UserAttributes {
  id: number;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  lastActive: Date;
  avatarUrl: string;
  backgroundUrl: string;
  aboutMe: string;
  online: boolean;
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

  @Column
  backgroundUrl: string;

  @Column({ defaultValue: false })
  online: boolean;

  @Column
  aboutMe: string;

  @BelongsToMany(() => Conversation, () => ConversationUser)
  conversations: Conversation[];

  @HasMany(() => ConversationUser)
  conversationUsers: ConversationUser[];

  @HasMany(() => MessageRecipient)
  messageUsers: MessageRecipient[];

  @HasMany(() => Friend, 'userId')
  friends: User[];
}
