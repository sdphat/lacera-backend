import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Seeder } from 'nestjs-seeder';
import { Conversation } from './models/conversation.model';
import { ConversationUser } from './models/conversation-user.model';
import { Message } from './models/message.model';
import { MessageUser } from './models/message-recipient.model';

@Injectable()
export class ConversationsSeeder implements Seeder {
  constructor(
    @InjectModel(ConversationUser) private readonly conversationUserModel: typeof ConversationUser,
    @InjectModel(Conversation) private readonly conversationModel: typeof Conversation,
    @InjectModel(Message) private readonly messageModel: typeof Message,
    @InjectModel(MessageUser) private readonly messageUserModel: typeof MessageUser,
  ) {}
  async seed(): Promise<any> {
    const privateConv = await this.conversationModel.create({ type: 'private' });
    const groupConv = await this.conversationModel.create({
      type: 'group',
      title: 'Skiing',
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
        type: 'text',
        senderId: 1,
        conversationId: privateConv.id,
        content: "Hey, how's it going?",
        createdAt: new Date(2023, 4, 18, 8),
      },
      {
        type: 'text',
        senderId: 2,
        conversationId: privateConv.id,
        content: "Hi! I'm good, thanks. How about you?",
        createdAt: new Date(2023, 4, 18, 8, 2),
      },
      {
        type: 'text',
        senderId: 2,
        conversationId: privateConv.id,
        content: "I'm doing well, thanks for asking. Did you catch the game last night?",
        createdAt: new Date(2023, 4, 18, 8, 3),
      },
      {
        type: 'text',
        senderId: 1,
        conversationId: groupConv.id,
        content: "Hey, how's it going?",
        createdAt: new Date(2023, 4, 18, 8),
      },
      {
        type: 'text',
        senderId: 2,
        conversationId: groupConv.id,
        content: "I'm good. How about you",
        createdAt: new Date(2023, 4, 18, 8, 2),
      },
      {
        type: 'text',
        senderId: 3,
        conversationId: groupConv.id,
        content: "I'm doing great right now. Thanks for asking.",
        createdAt: new Date(2023, 4, 18, 8, 3),
      },
    ]);
  }
  async drop(): Promise<any> {
    return;
  }
}
