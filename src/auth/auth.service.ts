import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
import { randomUUID } from 'crypto';
import { RefreshAccessTokenDto } from './dto/refreshToken.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../user/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}
  async refreshAccessToken({ phoneNumber, id, jwtFamilyId }: RefreshAccessTokenDto) {
    return {
      accessToken: await this.jwtService.signAsync(
        {
          id,
          jwtId: randomUUID(),
          jwtFamilyId,
          phoneNumber: phoneNumber,
        },
        {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRE_DURATION'),
        },
      ),
    };
  }

  async login(loginDto: LoginDto) {
    const foundUser = await this.usersService.findOneByPhoneNumber(loginDto.phoneNumber);
    if (!foundUser) {
      return {
        error: 'mismatch',
      };
    }

    const isMatch = await compare(loginDto.password, foundUser.password);
    const jwtFamilyId = randomUUID();
    if (isMatch) {
      return {
        id: foundUser.id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        avatarUrl: foundUser.avatarUrl,
        refreshToken: await this.jwtService.signAsync(
          {
            jwtId: jwtFamilyId,
            id: foundUser.id,
            phoneNumber: foundUser.phoneNumber,
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
          },
          {
            secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRE_DURATION'),
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
