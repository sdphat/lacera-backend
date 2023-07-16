import { ConnectedSocket, MessageBody, WebSocketGateway } from '@nestjs/websockets';
import { ExtendedSocket, ExtendedSubscribeMessage } from '../SocketUtils';
import { AuthGateway } from '../auth/authGateway';
import { UNAUTHORIZED_ERROR, WsAccessTokenGuard } from '../auth/wsAccessToken.guard';
import { ContactsService } from './contacts.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Public } from '../auth/accessToken.guard';
import { UseGuards } from '@nestjs/common';
import { SearchContactsDto } from './dto/search-contacts.dto';
import { SendFriendReqDto } from './dto/send-friend-req.dto';
import { CancelFriendReqDto } from './dto/cancel-friend-req.dto';
import { AcceptFriendReqDto } from './dto/accept-friend-req.dto';
import { RejectFriendReqDto } from './dto/reject-friend-req.dto';
import { FetchContactDto } from './dto/fetch-contact.dto';

@Public()
@WebSocketGateway({ namespace: 'contacts', cors: { origin: '*' } })
export class ContactsGateway extends AuthGateway {
  constructor(
    private readonly contactsService: ContactsService,
    jwtService: JwtService,
    configService: ConfigService,
  ) {
    super(jwtService, configService);
  }

  @ExtendedSubscribeMessage('fetchAll')
  @UseGuards(WsAccessTokenGuard)
  async fetchAll(@ConnectedSocket() client: ExtendedSocket) {
    if (!client.user) {
      return { error: UNAUTHORIZED_ERROR };
    }
    const user = client.user;
    let data = [];

    data = await this.contactsService.getAll(user.id);
    return { data };
  }

  @ExtendedSubscribeMessage('search')
  @UseGuards(WsAccessTokenGuard)
  async search(
    @ConnectedSocket() client: ExtendedSocket,
    @MessageBody() searchDto: SearchContactsDto,
  ) {
    if (!client.user) {
      return { error: UNAUTHORIZED_ERROR };
    }

    const data = await this.contactsService.search(searchDto);
    return { data };
  }

  @ExtendedSubscribeMessage('fetch')
  @UseGuards(WsAccessTokenGuard)
  async fetch(
    @ConnectedSocket() client: ExtendedSocket,
    @MessageBody() fetchContactDto: FetchContactDto,
  ) {
    if (!client.user) {
      return { error: UNAUTHORIZED_ERROR };
    }

    const data = await this.contactsService.findOne(fetchContactDto);
    return { data };
  }

  @ExtendedSubscribeMessage('sendFriendRequest')
  @UseGuards(WsAccessTokenGuard)
  async sendFriendRequest(
    @ConnectedSocket() client: ExtendedSocket,
    @MessageBody() sendFriendReqDto: SendFriendReqDto,
  ) {
    if (!client.user) {
      return { error: UNAUTHORIZED_ERROR };
    }

    await this.contactsService.sendFriendRequest(sendFriendReqDto);
    return {};
  }

  @ExtendedSubscribeMessage('cancelFriendRequest')
  @UseGuards(WsAccessTokenGuard)
  async cancelFriendRequest(
    @ConnectedSocket() client: ExtendedSocket,
    @MessageBody() cancelFriendReqDto: CancelFriendReqDto,
  ) {
    if (!client.user) {
      return { error: UNAUTHORIZED_ERROR };
    }

    await this.contactsService.cancelFriendRequest(cancelFriendReqDto);
    return {};
  }

  @ExtendedSubscribeMessage('acceptFriendRequest')
  @UseGuards(WsAccessTokenGuard)
  async acceptFriendRequest(
    @ConnectedSocket() client: ExtendedSocket,
    @MessageBody() acceptFriendReqDto: AcceptFriendReqDto,
  ) {
    if (!client.user) {
      return { error: UNAUTHORIZED_ERROR };
    }

    await this.contactsService.acceptFriendRequest(acceptFriendReqDto);
    return {};
  }

  @ExtendedSubscribeMessage('rejectFriendRequest')
  @UseGuards(WsAccessTokenGuard)
  async rejectFriendRequest(
    @ConnectedSocket() client: ExtendedSocket,
    @MessageBody() rejectFriendReqDto: RejectFriendReqDto,
  ) {
    if (!client.user) {
      return { error: UNAUTHORIZED_ERROR };
    }

    await this.contactsService.rejectFriendRequest(rejectFriendReqDto);
    return {};
  }
}
