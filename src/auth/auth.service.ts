import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { randomUUID } from 'crypto';
import { RefreshAccessTokenDto } from './dto/refreshToken.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/user/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}
  async refreshAccessToken({ phoneNumber }: RefreshAccessTokenDto) {
    console.warn('Auth: Running mockup credentials');
    return {
      accessToken: await this.jwtService.signAsync(
        {
          jwtId: randomUUID(),
          phoneNumber: phoneNumber,
        },
        {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: '48h',
        },
      ),
    };
  }

  async login(loginDto: LoginDto) {
    console.warn('Auth: Running mockup credentials');
    const foundUser = await this.usersService.findOne(loginDto.phoneNumber);
    if (!foundUser) {
      return {
        error: 'mismatch',
      };
    }

    const isMatch = await compare(loginDto.password, foundUser.password);
    if (isMatch) {
      return {
        refreshToken: await this.jwtService.signAsync(
          { jwtId: randomUUID(), phoneNumber: loginDto.phoneNumber },
          {
            privateKey: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            expiresIn: '5m',
          },
        ),
      };
    } else {
      return {
        error: 'mismatch',
      };
    }
  }
}
