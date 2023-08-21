import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, MessageBody, WebSocketGateway } from '@nestjs/websockets';
import { ExtendedSocket, ExtendedSubscribeMessage } from '../SocketUtils';
import { UNAUTHORIZED_ERROR, WsAccessTokenGuard } from '../auth/wsAccessToken.guard';
import { AuthGateway } from '../auth/authGateway';
import { UsersService } from './users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject, UseGuards } from '@nestjs/common';
import { CheckHeartbeatDto } from './dto/check-heartbeat.dto';
import { makeUserRedisOnlineKey } from '../utils';

@WebSocketGateway({ namespace: 'user', cors: { origin: '*' } })
export class UserGateway extends AuthGateway {
  constructor(
    usersService: UsersService,
    jwtService: JwtService,
    configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    super(jwtService, configService, usersService);
  }

  @ExtendedSubscribeMessage('heartbeat')
  @UseGuards(WsAccessTokenGuard)
  async heartbeat(@MessageBody() _messageBody, @ConnectedSocket() client: ExtendedSocket) {
    if (!client.user) {
      return { error: UNAUTHORIZED_ERROR };
    }

    await this.cacheManager.set(makeUserRedisOnlineKey(client.user.id), true, 5000);
  }

  // Check user's heartbeat
  @ExtendedSubscribeMessage('check-heartbeat')
  async checkHeartbeat(@MessageBody() { userId }: CheckHeartbeatDto) {
    const isOnline =
      (await this.cacheManager.get<boolean>(makeUserRedisOnlineKey(userId))) ?? false;
    return {
      data: {
        isOnline,
        userId,
      },
    };
  }
}
