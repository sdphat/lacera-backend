import { Injectable } from '@nestjs/common';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Conversation, GroupConversationAttributes } from './models/conversation.model';
import { User } from '../user/models/user.model';
import { ConversationUser } from './models/conversation-user.model';
import { ServiceFetchAllConversationsDto } from './dto/service-fetch-all-conversations.dto';
import { Message } from './models/message.model';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto';
import { Sequelize } from 'sequelize-typescript';
import { MessageRecipient } from './models/message-recipient.model';

const userReturnAttributes = ['id', 'firstName', 'lastName', 'lastActive', 'avatarUrl', 'online'];

/**
 * Inline adding message status field to every messages in provided conversation
 * @param conversation Conversation, messages is required to be loaded first
 * @param userId Issued user id
 * @returns Modified conversation
 */
const populateMessageStatusField = (conversation: Conversation, userId: number) => {
  conversation.messages.forEach((message) => {
    if (userId !== message.senderId) {
      const recipientMessageStatus =
        message.messageUsers.length > 0 ? message.messageUsers[0].messageStatus : 'received';
      message.status = recipientMessageStatus;
    }
  });
  return conversation;
};

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation) private readonly conversationModel: typeof Conversation,
    @InjectModel(ConversationUser) private readonly conversationUserModel: typeof ConversationUser,
  ) {}

  async createPrivate({
    participantIds,
    userId,
  }: {
    participantIds: [number, number];
    userId: number;
  }) {
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
            attributes: userReturnAttributes,
          },
          {
            model: Message,
            include: [
              {
                model: User,
                attributes: userReturnAttributes,
              },
              {
                model: MessageRecipient,
                attributes: ['messageStatus'],
                where: {
                  recipientId: userId,
                },
              },
            ],
            order: [['createdAt', 'ASC']],
          },
        ],
      });

      return populateMessageStatusField(conversation, userId);
    }

    try {
      const conversation = await this.conversationModel.create({
        type: 'private',
      });

      await this.conversationUserModel.bulkCreate(
        participantIds.map((id) => ({ userId: id, conversationId: conversation.id })),
      );

      const returnConversation = await this.conversationModel.findByPk(conversation.id, {
        include: [
          {
            model: User,
            attributes: userReturnAttributes,
          },
          {
            model: Message,
            include: [
              {
                model: User,
                attributes: userReturnAttributes,
              },
              {
                model: MessageRecipient,
                attributes: ['messageStatus'],
                where: {
                  recipientId: userId,
                },
              },
            ],
            order: [['createdAt', 'ASC']],
          },
        ],
      });

      return populateMessageStatusField(returnConversation, userId);
    } catch (ex) {
      console.log(ex);
      return {
        error: 'Some users do not exist',
      };
    }
  }

  async createGroup({ participantIds, title, userId }: CreateGroupConversationDto) {
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

    const returnConversation = await Conversation.findByPk(conversation.id, {
      include: [
        {
          model: User,
          attributes: userReturnAttributes,
        },
        {
          model: Message,
          include: [
            {
              model: User,
              attributes: userReturnAttributes,
            },
            {
              model: MessageRecipient,
              attributes: ['messageStatus'],
              required: false,
              where: {
                recipientId: userId,
              },
            },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    return populateMessageStatusField(
      returnConversation,
      userId,
    ) as any as GroupConversationAttributes;
  }

  async getAll({ query, user }: ServiceFetchAllConversationsDto) {
    const { id: userId } = user;
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
          attributes: userReturnAttributes,
        },
        {
          model: Message,
          include: [
            {
              model: User,
              attributes: userReturnAttributes,
            },
            {
              model: MessageRecipient,
              attributes: ['messageStatus'],
              required: false,
              where: {
                recipientId: userId,
              },
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
          attributes: userReturnAttributes,
        },
        {
          model: Message,
          include: [
            {
              model: User,
              attributes: userReturnAttributes,
            },
            {
              model: MessageRecipient,
              attributes: ['messageStatus'],
              required: false,
              where: {
                recipientId: userId,
              },
            },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    return [...groups, ...privates].map((conversation) =>
      populateMessageStatusField(conversation, userId),
    );
  }

  async findOneById({ id, userId }: { id: number; userId: number }) {
    const group = await this.conversationModel.findOne({
      where: {
        id,
        type: 'group',
      },
      include: [
        {
          model: User,
          attributes: userReturnAttributes,
        },
        {
          model: Message,
          include: [
            {
              model: User,
              attributes: userReturnAttributes,
            },
            {
              model: MessageRecipient,
              attributes: ['messageStatus'],
              required: false,
              where: {
                recipientId: userId,
              },
            },
          ],
        },
      ],
    });

    if (group) {
      populateMessageStatusField(group, userId);
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
          attributes: userReturnAttributes,
        },
        {
          model: Message,
          include: [
            {
              model: User,
              attributes: userReturnAttributes,
            },
            {
              model: MessageRecipient,
              attributes: ['messageStatus'],
              required: false,
              where: {
                recipientId: userId,
              },
            },
          ],
        },
      ],
    });

    populateMessageStatusField(privateConversation, userId);
    return privateConversation;
  }

  async findPrivateByUserIds(userId: number, participantIds: [number, number]) {
    const conversation = await this.conversationModel.findOne({
      where: {
        type: 'private',
      },
      include: [
        {
          model: User,
          where: {
            id: participantIds,
          },
          attributes: userReturnAttributes,
        },
        {
          model: Message,
          include: [
            {
              model: User,
              attributes: userReturnAttributes,
            },
            {
              model: MessageRecipient,
              attributes: ['messageStatus'],
              required: false,
              where: {
                recipientId: userId,
              },
            },
          ],
        },
      ],
    });
    populateMessageStatusField(conversation, userId);
    return conversation;
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
