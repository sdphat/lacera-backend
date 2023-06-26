import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ERROR_EVENT_KEY, ExtendedSocket } from '../SocketUtils';

@Injectable()
export class WsAccessTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const [client]: [ExtendedSocket] = context.getArgs();
    const authHeader = client.handshake.auth.token;
    if (!authHeader.startsWith('Bearer ')) {
      client.emit(ERROR_EVENT_KEY, {
        error: 'unauthorized',
      });
      return false;
    }
    const token = authHeader.replace('Bearer ', '');
    try {
      const user = await this.jwtService.verifyAsync(token, {
        ignoreExpiration: false,
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      });
      client.user = user;
      return true;
    } catch (ex) {
      client.emit(ERROR_EVENT_KEY, { error: 'unauthorized' });
      return false;
    }
  }
}
