import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Conversation } from './models/conversation.model';
import { User } from '../user/models/user.model';
import { ConversationUser } from './models/conversation-user.model';
import { ServiceFetchAllConversationsDto } from './dto/service-fetch-all-conversations.dto';
import { Message } from './models/message.model';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation) private readonly conversationModel: typeof Conversation,
    @InjectModel(ConversationUser) private readonly conversationUserModel: typeof ConversationUser,
  ) {}

  async create({ participantIds }: CreateConversationDto) {
    const conversation = await this.conversationModel.create();
    try {
      await this.conversationUserModel.bulkCreate(
        participantIds.map((id) => ({ userId: id, conversationId: conversation.id })),
      );
    } catch (ex) {
      return {
        error: 'Some users do not exist',
      };
    }
    return conversation;
  }

  async getAll({ query, user }: ServiceFetchAllConversationsDto) {
    const matchedConversations = await this.conversationModel.findAll({
      include: [
        {
          model: User,
          where: [
            {
              id: user.id,
            },
          ],
          attributes: [],
        },
      ],
      attributes: ['id'],
    });
    const matchedConversationIds = matchedConversations.map((c) => c.id);

    const conversations = await this.conversationModel.findAll({
      where: {
        id: matchedConversationIds,
      },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'lastActive', 'avatarUrl'],
        },
        {
          model: Message,
          include: [
            {
              model: User,
              attributes: ['id', 'firstName', 'lastName', 'lastActive', 'avatarUrl'],
              order: [['createdAt', 'ASC']],
            },
          ],
        },
      ],
    });
    return conversations;
  }

  findOne(id: number) {
    return this.conversationModel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'lastActive', 'avatarUrl'],
        },
        {
          model: Message,
          include: [
            {
              model: User,
              attributes: ['id', 'firstName', 'lastName', 'lastActive', 'avatarUrl'],
            },
          ],
        },
      ],
    });
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
