import { Injectable } from '@nestjs/common';
import { CreateMessageServiceDto } from './dto/create-message.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './models/message.model';
import { User } from '../user/models/user.model';
import { Conversation } from '../conversation/models/conversation.model';
import { MessageUser } from './models/message-recipient.model';

const userReturnAttributes = ['id', 'firstName', 'lastName', 'lastActive', 'avatarUrl', 'online'];

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message) private readonly messageModel: typeof Message,
    @InjectModel(Conversation) private readonly conversationModel: typeof Conversation,
    @InjectModel(MessageUser) private readonly messageUserModel: typeof MessageUser,
  ) {}
  async create({ userId, content, conversationId, postDate }: CreateMessageServiceDto) {
    const conversation = await this.conversationModel.findByPk(conversationId);
    if (conversation) {
      const { id } = await this.messageModel.create({
        senderId: userId,
        conversationId,
        createdAt: postDate,
        content,
      });
      return this.messageModel.findByPk(id, {
        include: [
          {
            model: User,
            attributes: userReturnAttributes,
          },
        ],
      });
    } else {
      throw new Error('No conversation found');
    }
  }

  async updateMessageStatus({ userId, messageId }: { userId: number; messageId: number }) {
    await this.messageUserModel.findOrCreate({
      where: {
        recipientId: userId,
        messageId,
      },
    });
  }

  async softDelete({ messageId, userId }: { messageId: number; userId: number }) {
    this.messageUserModel.upsert({
      recipientId: userId,
      messageId: messageId,
      messageStatus: 'deleted',
    });
    // const messageUser = await this.messageUserModel.findOne({
    //   where: {
    //     userId: userId,
    //     messageId: messageId,
    //   },
    // });
    // if (messageUser) {
    //   messageUser.messageStatus = 'deleted';
    //   await messageUser.save();
    // } else {
    //   await this.messageUserModel.create({
    //     userId,
    //     messageId: messageId,
    //     messageStatus: 'deleted',
    //   });
    // }
  }
}
