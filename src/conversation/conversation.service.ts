import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Conversation, GroupConversationAttributes } from './models/conversation.model';
import { User } from '../user/models/user.model';
import { ConversationUser } from './models/conversation-user.model';
import { FetchAllConversationsDto } from './dto/service-fetch-all-conversations.dto';
import { Message } from './models/message.model';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto';
import { Sequelize } from 'sequelize-typescript';
import { MessageUser } from './models/message-recipient.model';
import { Includeable } from 'sequelize';
import { MessageService } from './message.service';
import { MessageReaction } from './models/message-reaction.model';

const userReturnAttributes = ['id', 'firstName', 'lastName', 'lastActive', 'avatarUrl', 'online'];

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
        attributes: ['recipientId', 'messageStatus'],
        // where: {
        //   [Op.not]: {
        //     recipientId: userId,
        //     messageStatus: 'deleted',
        //   },
        // },
      },
      {
        model: MessageReaction,
        required: false,
      },
      {
        model: Message,
        as: 'replyTo',
        include: [
          {
            model: User,
            attributes: ['firstName', 'lastName'],
          },
        ],
      },
    ],
    order: [['id', 'ASC']],
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
        // Add to list if user hasn't received message
        if (
          !m.messageUsers.length ||
          m.messageUsers.every(({ recipientId }) => recipientId !== userId)
        ) {
          return true;
        }
        // Add to list if user's message hasn't been deleted
        return m.messageUsers.some(
          ({ recipientId, messageStatus }) => recipientId === userId && messageStatus !== 'deleted',
        );
      }),
      {
        raw: true,
      },
    );
    return conversation;
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

  async getAll({ user }: FetchAllConversationsDto) {
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
      const filteredMessage = conversation.messages.filter((m) => {
        // Add to list if user hasn't received message
        if (
          !m.messageUsers.length ||
          !m.messageUsers.find(({ recipientId }) => recipientId === userId)
        ) {
          return true;
        }
        // Add to list if user's message hasn't been deleted
        return m.messageUsers.some(
          ({ recipientId, messageStatus }) => recipientId === userId && messageStatus !== 'deleted',
        );
      });
      filteredMessage.sort((m1, m2) => m1.id - m2.id);
      conversation.set('messages', filteredMessage, {
        raw: true,
      });
      return conversation;
    });
  }

  async findOneById({ id, userId }: { id: number; userId: number }) {
    return this.getConversation(id, userId);
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
              required: false,
              attributes: ['recipientId', 'messageStatus'],
            },
            {
              model: MessageReaction,
              required: false,
            },
            // {
            //   model: Message,
            //   as: 'replyTo',
            //   include: [
            //     {
            //       model: User,
            //       attributes: userReturnAttributes,
            //     },
            //   ],
            // },
          ],
        },
      ],
    });
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
