import { Injectable } from '@nestjs/common';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { InjectModel } from '@nestjs/sequelize';
import {
  Conversation,
  ConversationType,
  GroupConversationAttributes,
} from './models/conversation.model';
import { User } from '../user/models/user.model';
import { ConversationUser } from './models/conversation-user.model';
import { ServiceFetchAllConversationsDto } from './dto/service-fetch-all-conversations.dto';
import { Message } from './models/message.model';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto';
import { Sequelize } from 'sequelize-typescript';
import { MessageUser } from './models/message-recipient.model';
import { Includeable, Op } from 'sequelize';
import { MessageService } from './message.service';

const userReturnAttributes = ['id', 'firstName', 'lastName', 'lastActive', 'avatarUrl', 'online'];

/**
 * Inline adding message status field to every messages in provided conversation
 * @param conversation Conversation, messages is required to be loaded first
 * @param userId Issued user id
 * @returns Modified conversation
 */
const populateMessageStatusField = (conversation: Conversation, userId: number) => {
  conversation.messages.forEach((message) => {
    // If the user is on recipient side
    // then update the message status to match with that side.
    if (userId !== message.senderId) {
      const recipientMessageStatus =
        message.messageUsers.length > 0 ? message.messageUsers[0].messageStatus : 'received';
      message.status = recipientMessageStatus;
    }
  });
  return conversation;
};

const getConversationInclude = (userId: number): Includeable[] => [
  {
    model: User,
    attributes: userReturnAttributes,
  },
  {
    model: ConversationUser,
    attributes: [],
    where: {
      userId,
      deleted: false,
    },
  },
  {
    model: Message,
    include: [
      {
        model: User,
        attributes: userReturnAttributes,
      },
      {
        model: MessageUser,
        required: false,
        attributes: ['messageStatus'],
        where: {
          recipientId: userId,
        },
      },
    ],
    order: [['createdAt', 'ASC']],
  },
];

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation) private readonly conversationModel: typeof Conversation,
    @InjectModel(ConversationUser) private readonly conversationUserModel: typeof ConversationUser,
    @InjectModel(Message) private readonly messageModel: typeof Message,
    private readonly messageService: MessageService,
  ) {}

  private async getConversation(conversationId: number, userId: number) {
    const conversationUser = await this.conversationUserModel.findOne({
      where: {
        conversationId,
        userId,
      },
    });
    if (conversationUser.deleted) {
      return null;
    }
    const conversation = await this.conversationModel.findByPk(conversationId, {
      include: getConversationInclude(userId),
    });
    conversation.set(
      'messages',
      conversation.messages.filter((m) => {
        if (!m.messageUsers.length) {
          return true;
        }
        return m.messageUsers[0].messageStatus !== 'deleted';
      }),
      {
        raw: true,
      },
    );
    return populateMessageStatusField(conversation, userId);
  }

  async findOrCreatePrivate({
    participantIds,
    userId,
  }: {
    participantIds: [number, number];
    userId: number;
  }) {
    let conversationUser: ConversationUser | null;
    try {
      conversationUser = await this.conversationUserModel.findOne({
        attributes: ['conversationId', 'userId', 'deleted'],
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
      return;
    }

    if (conversationUser) {
      try {
        conversationUser.deleted = false;
        await conversationUser.save();
        return this.getConversation(conversationUser.conversationId, userId);
      } catch (ex) {
        console.log(ex);
      }
    }

    try {
      const conversation = await this.conversationModel.create({
        type: 'private',
      });

      await this.conversationUserModel.bulkCreate(
        participantIds.map((id) => ({ userId: id, conversationId: conversation.id })),
      );

      return this.getConversation(conversation.id, userId);
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
    return this.getConversation(conversation.id, userId) as any as GroupConversationAttributes;
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
      include: getConversationInclude(userId),
    });

    const privates = await this.conversationModel.findAll({
      where: {
        id: matchedConversationIds,
        type: 'private',
      },
      include: getConversationInclude(userId),
    });

    return [...groups, ...privates].map((conversation) => {
      conversation.set(
        'messages',
        conversation.messages.filter((m) => {
          if (!m.messageUsers.length) {
            return true;
          }
          return m.messageUsers[0].messageStatus !== 'deleted';
        }),
        {
          raw: true,
        },
      );
      return populateMessageStatusField(conversation, userId);
    });
  }

  async findOneById({ id, userId }: { id: number; userId: number }) {
    return this.getConversation(id, userId);
    // const group = await this.conversationModel.findOne({
    //   where: {
    //     id,
    //     type: 'group',
    //   },
    //   include: getConversationInclude(userId),
    // });

    // if (group) {
    //   populateMessageStatusField(group, userId);
    //   return group;
    // }

    // const privateConversation = await this.conversationModel.findOne({
    //   where: {
    //     id,
    //     type: 'private',
    //   },
    //   include: getConversationInclude(userId),
    // });
    // populateMessageStatusField(privateConversation, userId);

    // return privateConversation;
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
            // This part is different from normal get conversation case
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
              model: MessageUser,
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

  async remove({ id, userId }: { id: number; userId: number }) {
    await this.conversationUserModel.update(
      { deleted: true },
      {
        where: {
          conversationId: id,
          userId,
        },
      },
    );
    const messages = await this.messageModel.findAll({
      where: {
        conversationId: id,
      },
    });
    return Promise.all(
      messages.map(async (message) =>
        this.messageService.softDelete({ messageId: message.id, userId }),
      ),
    );
  }
}
