import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  WebSocketGateway,
} from '@nestjs/websockets';
import { ExtendedSocket, ExtendedSubscribeMessage, ExtendedWsResponse } from '../SocketUtils';
import { WsAccessTokenGuard } from '../auth/wsAccessToken.guard';
import { Public } from '../auth/accessToken.guard';
import { ConversationService } from './conversation.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './models/message.model';
import { MessageService } from './message.service';
import { FetchAllConversationsDto } from './dto/fetch-all-conversations.dto';
import { Observable, of, from } from 'rxjs';
import { Conversation } from './models/conversation.model';
import { Socket } from 'socket.io';
import { ConversationDetailsDto } from './dto/conversation-details.dto';

@Public()
@WebSocketGateway({ namespace: 'conversation', cors: { origin: '*' } })
export class ConversationGateway {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessageService,
  ) {}

  @ExtendedSubscribeMessage('create')
  @UseGuards(WsAccessTokenGuard)
  async create(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: ExtendedSocket,
  ): Promise<ExtendedWsResponse<Message> | Observable<ExtendedWsResponse<Message>>> {
    try {
      const message = await this.messageService.create({
        userId: client.user.id,
        ...createMessageDto,
      });
      const conversation = await this.conversationService.findOne(message.conversationId);
      const participantIds = conversation.participants.map((p) => p.id);
      participantIds.forEach((id) => client.to(`users/${id}`).emit('update', message));
      client.emit('create', message);
    } catch (ex) {
      return { event: 'create:error', data: ex.message };
    }
  }

  @ExtendedSubscribeMessage('fetchAll')
  @UseGuards(WsAccessTokenGuard)
  async fetchAll(
    @ConnectedSocket() client: ExtendedSocket,
    @MessageBody() fetchAllDto?: FetchAllConversationsDto,
  ): Promise<Conversation[]> {
    const user = client.user;
    let data = [];

    client.join(`users/${user.id}`);
    data = await this.conversationService.getAll({ ...fetchAllDto, user });
    return data;
  }

  @ExtendedSubscribeMessage('details')
  @UseGuards(WsAccessTokenGuard)
  async getDetails(
    @ConnectedSocket() client: ExtendedSocket,
    @MessageBody() conversationDetailsDto: ConversationDetailsDto,
  ): Promise<Conversation> {
    const data = await this.conversationService.findOne(conversationDetailsDto.conversationId);
    return data;
  }
}
