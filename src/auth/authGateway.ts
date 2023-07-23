import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ExtendedSocket } from '../SocketUtils';
import { UsersService } from 'src/user/users.service';

export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    protected readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    protected readonly usersService: UsersService,
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
      this.usersService.update(user.id, { online: true });
    } catch (ex) {
      return;
    }
  }

  async handleDisconnect(client: ExtendedSocket) {
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

      this.usersService.update(user.id, { online: false, lastActive: new Date() });
    } catch (ex) {
      return;
    }
  }
}
