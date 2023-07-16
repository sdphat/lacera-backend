import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection } from '@nestjs/websockets';
import { ExtendedSocket } from '../SocketUtils';

export class AuthGateway implements OnGatewayConnection {
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
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
}
