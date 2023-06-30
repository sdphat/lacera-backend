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
import { Conversation } from './models/conversation.model';
import { ConversationDetailsDto } from './dto/conversation-details.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Public()
@WebSocketGateway({ namespace: 'conversation', cors: { origin: '*' } })
export class ConversationGateway implements OnGatewayConnection {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: ExtendedSocket, ...args: any[]) {
    const authHeader = client.handshake.auth.token;
    if (!authHeader.startsWith('Bearer ')) {
      return;
    }
    const token = authHeader.replace('Bearer ', '');
    try {
      const user = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: false,
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });
      client.join(`users/${user.id}`);
    } catch (ex) {
      return;
    }
  }

  @ExtendedSubscribeMessage('create')
  @UseGuards(WsAccessTokenGuard)
  async create(
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
      const conversation = await this.conversationService.findOne(message.conversationId);
      const participantIds = conversation.participants.map((p) => p.id);
      client.emit('update', message);
      participantIds.forEach((id) => client.to(`users/${id}`).emit('update', message));
      return { data: message };
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
    const data = await this.conversationService.findOne(conversationDetailsDto.conversationId);
    return { data };
  }
}
