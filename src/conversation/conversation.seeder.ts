import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Seeder } from 'nestjs-seeder';
import { Conversation } from './models/conversation.model';
import { ConversationUser } from './models/conversation-user.model';
import { Message } from './models/message.model';
import { MessageRecipient } from './models/message-recipient.model';

@Injectable()
export class ConversationsSeeder implements Seeder {
  constructor(
    @InjectModel(ConversationUser) private readonly conversationUserModel: typeof ConversationUser,
    @InjectModel(Conversation) private readonly conversationModel: typeof Conversation,
    @InjectModel(Message) private readonly messageModel: typeof Message,
    @InjectModel(MessageRecipient) private readonly messageUserModel: typeof MessageRecipient,
  ) {}
  async seed(): Promise<any> {
    const privateConv = await this.conversationModel.create({ type: 'private' });
    const groupConv = await this.conversationModel.create({
      type: 'group',
      title: 'Skiing',
      background: 'background_2.jpg',
    });
    await this.conversationUserModel.bulkCreate([
      { conversationId: privateConv.id, userId: 1 },
      {
        conversationId: privateConv.id,
        userId: 2,
      },
      { conversationId: groupConv.id, userId: 1 },
      {
        conversationId: groupConv.id,
        userId: 2,
      },
      {
        conversationId: groupConv.id,
        userId: 3,
      },
    ]);
    const messages = await this.messageModel.bulkCreate([
      {
        senderId: 1,
        conversationId: privateConv.id,
        content: 'Hello World',
        createdAt: new Date(2023, 4, 18, 8),
      },
      {
        senderId: 2,
        conversationId: privateConv.id,
        content: 'What the hell?',
        createdAt: new Date(2023, 4, 18, 8, 2),
      },
      {
        senderId: 2,
        conversationId: privateConv.id,
        content: 'Stop talking like that',
        createdAt: new Date(2023, 4, 18, 8, 3),
      },
      {
        senderId: 1,
        conversationId: groupConv.id,
        content: 'Hello World',
        createdAt: new Date(2023, 4, 18, 8),
      },
      {
        senderId: 2,
        conversationId: groupConv.id,
        content: 'What the hell?',
        createdAt: new Date(2023, 4, 18, 8, 2),
      },
      {
        senderId: 3,
        conversationId: groupConv.id,
        content: 'Stop talking like that',
        createdAt: new Date(2023, 4, 18, 8, 3),
      },
    ]);
  }
  async drop(): Promise<any> {
    return;
  }
}
