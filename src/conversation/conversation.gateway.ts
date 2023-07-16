import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ExtendedSocket, ExtendedSubscribeMessage } from '../SocketUtils';
import { UNAUTHORIZED_ERROR, WsAccessTokenGuard } from '../auth/wsAccessToken.guard';
import { Public } from '../auth/accessToken.guard';
import { ConversationService } from './conversation.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './models/message.model';
import { MessageService } from './message.service';
import { FetchAllConversationsDto } from './dto/fetch-all-conversations.dto';
import {
  Conversation,
  GroupConversationAttributes,
  PrivateConversationAttributes,
} from './models/conversation.model';
import { ConversationDetailsDto } from './dto/conversation-details.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGateway } from '../auth/authGateway';
import { CreatePrivateConversationDto } from './dto/create-private-conversation.dto';
import { CreateGroupConversationDto } from './dto/create-group-conversation.dto';

@Public()
@WebSocketGateway({ namespace: 'conversation', cors: { origin: '*' } })
export class ConversationGateway extends AuthGateway implements OnGatewayConnection {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    jwtService: JwtService,
    configService: ConfigService,
  ) {
    super(jwtService, configService);
  }

  @ExtendedSubscribeMessage('createMessage')
  @UseGuards(WsAccessTokenGuard)
  async createMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: ExtendedSocket,
  ): Promise<{ data: Message } | { error: string }> {
    if (!client.user) {
      return { error: UNAUTHORIZED_ERROR };
    }
    try {
      const message = await this.messageService.create({
        userId: client.user.id,
        ...createMessageDto,
      });
      const conversation = await this.conversationService.findOneById(message.conversationId);
      const participantIds = conversation.participants.map((p) => p.id);
      client.emit('update', message);
      participantIds.forEach((id) => client.to(`users/${id}`).emit('update', message));
      return { data: message };
    } catch (ex) {
      return { error: ex.message };
    }
  }

  @ExtendedSubscribeMessage('createPrivate')
  @UseGuards(WsAccessTokenGuard)
  async createPrivate(
    @MessageBody() { targetId }: CreatePrivateConversationDto,
    @ConnectedSocket() client: ExtendedSocket,
  ): Promise<{ data: PrivateConversationAttributes } | { error: string }> {
    if (!client.user) {
      return { error: UNAUTHORIZED_ERROR };
    }
    if (targetId === client.user.id) {
      return { error: 'target id cannot be the same as user id' };
    }
    const participantIds: [number, number] = [targetId, client.user.id];
    try {
      if (participantIds && participantIds.length === 2) {
        const response = await this.conversationService.createPrivate({ participantIds });
        if ('error' in response) {
          return { error: response.error };
        }
        return { data: response as PrivateConversationAttributes };
      }
      return { error: 'malformatted' };
    } catch (ex) {
      return { error: 'server error' };
    }
  }

  @ExtendedSubscribeMessage('createGroup')
  @UseGuards(WsAccessTokenGuard)
  async createGroup(
    @MessageBody() { participantIds, title }: CreateGroupConversationDto,
    @ConnectedSocket() client: ExtendedSocket,
  ): Promise<{ data: GroupConversationAttributes } | { error: string }> {
    if (!client.user) {
      return { error: UNAUTHORIZED_ERROR };
    }
    if (!participantIds.length) {
      return { error: 'participantIds list cannot be empty' };
    }
    try {
      const conversation = (await this.conversationService.createGroup({
        participantIds: [...participantIds, client.user.id],
        title: title,
      })) as GroupConversationAttributes;
      return { data: conversation };
    } catch (ex) {
      return { error: ex.message };
    }
  }

  @ExtendedSubscribeMessage('fetchAll')
  @UseGuards(WsAccessTokenGuard)
  async fetchAll(
    @ConnectedSocket() client: ExtendedSocket,
    @MessageBody() fetchAllDto?: FetchAllConversationsDto,
  ): Promise<{ data: Conversation[] } | { error: string }> {
    if (!client.user) {
      return { error: UNAUTHORIZED_ERROR };
    }
    const user = client.user;
    let data = [];

    data = await this.conversationService.getAll({ ...fetchAllDto, user });
    return { data };
  }

  @ExtendedSubscribeMessage('details')
  @UseGuards(WsAccessTokenGuard)
  async getDetails(
    @ConnectedSocket() client: ExtendedSocket,
    @MessageBody() conversationDetailsDto: ConversationDetailsDto,
  ): Promise<{ data: Conversation } | { error: string }> {
    if (!client.user) {
      return { error: UNAUTHORIZED_ERROR };
    }

    if (conversationDetailsDto.conversationId) {
      const data = await this.conversationService.findOneById(
        conversationDetailsDto.conversationId,
      );
      return { data };
    }

    if (conversationDetailsDto.userId) {
      const data = await this.conversationService.findPrivateByUserIds([
        conversationDetailsDto.userId,
        client.user.id,
      ]);
      return { data };
    }
  }
}
