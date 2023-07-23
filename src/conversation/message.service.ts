import { Injectable } from '@nestjs/common';
import { CreateMessageServiceDto } from './dto/create-message.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './models/message.model';
import { User } from '../user/models/user.model';
import { Conversation } from '../conversation/models/conversation.model';

const userReturnAttributes = ['id', 'firstName', 'lastName', 'lastActive', 'avatarUrl', 'online'];

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message) private readonly messageModel: typeof Message,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Conversation) private readonly conversationModel: typeof Conversation,
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

  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
