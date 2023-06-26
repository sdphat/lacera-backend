import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from './accessToken.strategy';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from '../user/users.service';
import { UsersModule } from '../user/users.module';
import { RefreshTokenStrategy } from './refreshToken.strategy';

@Module({
  imports: [JwtModule.register({}), PassportModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, ConfigService, UsersService, RefreshTokenStrategy],
})
export class AuthModule {}
