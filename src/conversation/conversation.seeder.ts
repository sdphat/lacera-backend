import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Seeder } from 'nestjs-seeder';
import { Conversation } from './models/conversation.model';
import { ConversationUser } from './models/conversation-user.model';
import { Message } from './models/message.model';

@Injectable()
export class ConversationsSeeder implements Seeder {
  constructor(
    @InjectModel(ConversationUser) private readonly conversationUserModel: typeof ConversationUser,
    @InjectModel(Conversation) private readonly conversationModel: typeof Conversation,
    @InjectModel(Message) private readonly messageModel: typeof Message,
  ) {}
  async seed(): Promise<any> {
    await this.conversationModel.bulkCreate([
      { title: 'Games', avatar: '/photo-1534528741775-53994a69daeb.jpg' },
      { title: 'Study', avatar: '/photo-1534528741775-53994a69daeb.jpg' },
    ]);
    await this.conversationUserModel.bulkCreate([
      { conversationId: 1, userId: 1 },
      {
        conversationId: 1,
        userId: 2,
      },
      { conversationId: 2, userId: 1 },
      {
        conversationId: 2,
        userId: 2,
      },
      {
        conversationId: 2,
        userId: 3,
      },
    ]);
    await this.messageModel.bulkCreate([
      {
        senderId: 1,
        conversationId: 1,
        content: 'Hello World',
        createdAt: new Date(2023, 4, 18, 8),
      },
      {
        senderId: 2,
        conversationId: 1,
        content: 'What the hell?',
        createdAt: new Date(2023, 4, 18, 8, 2),
      },
      {
        senderId: 2,
        conversationId: 1,
        content: 'Stop talking like that',
        createdAt: new Date(2023, 4, 18, 8, 3),
      },
      {
        senderId: 1,
        conversationId: 2,
        content: 'Hello World',
        createdAt: new Date(2023, 4, 18, 8),
      },
      {
        senderId: 2,
        conversationId: 2,
        content: 'What the hell?',
        createdAt: new Date(2023, 4, 18, 8, 2),
      },
      {
        senderId: 3,
        conversationId: 2,
        content: 'Stop talking like that',
        createdAt: new Date(2023, 4, 18, 8, 3),
      },
    ]);
  }
  async drop(): Promise<any> {
    return;
  }
}
