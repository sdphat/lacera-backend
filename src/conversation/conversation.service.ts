import { Injectable } from '@nestjs/common';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Conversation } from './models/conversation.model';
import { User } from '../user/models/user.model';
import { ConversationUser } from './models/conversation-user.model';
import { ServiceFetchAllConversationsDto } from './dto/service-fetch-all-conversations.dto';
import { Message } from './models/message.model';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation) private readonly conversationModel: typeof Conversation,
    @InjectModel(ConversationUser) private readonly conversationUserModel: typeof ConversationUser,
  ) {}

  async createPrivate({ participantIds }: { participantIds: [number, number] }) {
    let conversationUser;
    try {
      conversationUser = await this.conversationUserModel.findOne({
        attributes: ['conversationId'],
        having: Sequelize.literal('COUNT(DISTINCT conversationUser.userId) = 2'),
        group: ['conversationId'],
        where: {
          userId: participantIds,
        },
        include: [
          {
            model: Conversation,
            where: {
              type: 'private',
            },
          },
        ],
      });
    } catch (ex) {
      console.log(ex);
    }

    if (conversationUser) {
      const conversation = await this.conversationModel.findByPk(conversationUser.conversationId, {
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
            order: [['createdAt', 'ASC']],
          },
        ],
      });
      return conversation;
    }

    try {
      const conversation = await this.conversationModel.create({
        type: 'private',
      });

      await this.conversationUserModel.bulkCreate(
        participantIds.map((id) => ({ userId: id, conversationId: conversation.id })),
      );

      return this.conversationModel.findByPk(conversation.id, {
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
            order: [['createdAt', 'ASC']],
          },
        ],
      });
    } catch (ex) {
      console.log(ex);
      return {
        error: 'Some users do not exist',
      };
    }
  }

  async createGroup({ participantIds, title }: CreateGroupConversationDto) {
    let conversation;
    try {
      conversation = await this.conversationModel.create({
        title,
        type: 'group',
      });
    } catch (ex) {
      return {
        error: 'server error',
      };
    }

    try {
      await this.conversationUserModel.bulkCreate(
        participantIds.map((id) => ({ userId: id, conversationId: conversation.id })),
      );
    } catch (ex) {
      await conversation.destroy();
      return {
        error: 'some users do not exist',
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

    const groups = await this.conversationModel.findAll({
      where: {
        id: matchedConversationIds,
        type: 'group',
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
            },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
    });
    const privates = await this.conversationModel.findAll({
      where: {
        id: matchedConversationIds,
        type: 'private',
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
            },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    return [...groups, ...privates];
  }

  async findOneById(id: number) {
    const group = await this.conversationModel.findOne({
      where: {
        id,
        type: 'group',
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
            },
          ],
        },
      ],
    });
    if (group) {
      return group;
    }

    const privateConversation = await this.conversationModel.findOne({
      where: {
        id,
        type: 'private',
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
            },
          ],
        },
      ],
    });
    return privateConversation;
  }

  async findPrivateByUserIds(participantIds: [number, number]) {
    return this.conversationModel.findOne({
      where: {
        type: 'private',
      },
      include: [
        {
          model: User,
          where: {
            id: participantIds,
          },
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
