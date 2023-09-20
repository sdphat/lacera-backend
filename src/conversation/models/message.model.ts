import {
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  Table,
  HasMany,
  BeforeCreate,
  BeforeUpdate,
  AfterFind,
} from 'sequelize-typescript';
import { Conversation } from '../models/conversation.model';
import { User } from '../../user/models/user.model';
import { MessageUser } from './message-recipient.model';
import { MessageReaction } from './message-reaction.model';
import { EncryptionService } from '../../services/EncryptionService';

export type MessageStatus = 'received' | 'deleted';

export type MessageType = 'file' | 'text';

@Table({ paranoid: true })
export class Message extends Model {
  @Column
  type: MessageType;

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

  @Column({
    set(content: string) {
      const encryptionService = new EncryptionService();
      this.setDataValue('content', encryptionService.encrypt(content));
    },
    get() {
      const encryptionService = new EncryptionService();
      const encryptedContent = this.getDataValue('content');
      return encryptionService.decrypt(encryptedContent);
    },
  })
  content: string;

  @Column
  createdAt: Date;

  @Column
  replyToId: number;

  @BelongsTo(() => Message, { foreignKey: 'replyToId', as: 'replyTo' })
  replyTo: Message;

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

  @Column
  fileName: string;

  @Column
  size: number;
}
