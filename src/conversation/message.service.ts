import { Injectable } from '@nestjs/common';
import { CreateMessageServiceDto } from './dto/create-message.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from './models/message.model';
import { User } from '../user/models/user.model';
import { Conversation } from '../conversation/models/conversation.model';
import { MessageUser } from './models/message-recipient.model';
import { RETRIEVED_MESSAGE_SYSTEM_NOTIFICATION } from '../constants';
import { MessageReaction, ReactionType } from './models/message-reaction.model';
import { join } from 'path';
import { stat } from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { FileUploadService } from '../services/FileUploadService';

const userReturnAttributes = ['id', 'firstName', 'lastName', 'lastActive', 'avatarUrl', 'online'];

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message) private readonly messageModel: typeof Message,
    @InjectModel(Conversation) private readonly conversationModel: typeof Conversation,
    @InjectModel(MessageUser) private readonly messageUserModel: typeof MessageUser,
    @InjectModel(MessageReaction) private readonly messageReactionModel: typeof MessageReaction,
    private readonly configService: ConfigService,
    private readonly fileUploadService: FileUploadService,
  ) {}
  async create({
    type,
    userId,
    content,
    conversationId,
    postDate,
    replyTo,
    fileName,
  }: CreateMessageServiceDto) {
    const conversation = await this.conversationModel.findByPk(conversationId);
    if (!conversation) {
      throw new Error('No conversation found');
    }
    let id: number;
    if (type === 'text') {
      const response = await this.messageModel.create({
        type,
        senderId: userId,
        conversationId,
        createdAt: postDate,
        content: content as string,
        replyToId: replyTo,
      });
      id = response.id;
    }
    try {
      if (type === 'file') {
        const fileUrl = content;
        let filePath: string;
        try {
          filePath = this.fileUploadService.filePathToLocal(fileUrl);
        } catch (ex) {
          return { error: 'Url malformatted' };
        }

        const file = await stat(filePath);

        const response = await this.messageModel.create({
          type,
          senderId: userId,
          conversationId,
          createdAt: postDate,
          content: fileUrl,
          replyToId: replyTo,
          fileName,
          size: file.size,
        });
        id = response.id;
      }
    } catch (ex) {
      console.log(ex);
    }
    return this.findOneById({ messageId: id });
  }

  async findOneById({ messageId }: { messageId: number }) {
    return this.messageModel.findByPk(messageId, {
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
    });
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
    await this.messageUserModel.upsert({
      recipientId: userId,
      messageId: messageId,
      messageStatus: 'deleted',
    });
  }

  async delete({ messageId, userId }: { messageId: number; userId: number }) {
    const foundMessage = await this.messageModel.findOne({
      where: {
        id: messageId,
        senderId: userId,
      },
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
      ],
    });

    if (foundMessage) {
      if (foundMessage.type === 'file') {
        await this.fileUploadService.remove(
          this.fileUploadService.filePathToLocal(foundMessage.content),
        );
        foundMessage.fileName = null;
        foundMessage.size = null;
      }
      foundMessage.content = RETRIEVED_MESSAGE_SYSTEM_NOTIFICATION;
      foundMessage.status = 'deleted';
      await foundMessage.save();
      return foundMessage;
    }
    return null;
  }

  async react({
    messageId,
    userId,
    reactionType,
  }: {
    messageId: number;
    userId: number;
    reactionType: ReactionType;
  }) {
    const message = await this.findOneById({ messageId });
    const messageReaction = message.reactions.find(
      (messageReaction) =>
        messageReaction.userId === userId && messageReaction.type === reactionType,
    );

    if (messageReaction) {
      const reactionId = messageReaction.id;
      await messageReaction.destroy();
      message.reactions = message.reactions.filter((mr) => mr.id !== reactionId);
      message.set('reactions', message.reactions);
    } else {
      const newMessageReaction = await this.messageReactionModel.create({
        messageId,
        userId,
        type: reactionType,
      });
      message.reactions.push(newMessageReaction);
    }

    return message;
  }
}
