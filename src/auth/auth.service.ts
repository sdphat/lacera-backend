import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { compare, hash } from 'bcrypt';
import { randomUUID } from 'crypto';
import { RefreshAccessTokenDto } from './dto/refreshToken.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../user/users.service';
import { RegisterDto } from './dto/register.dto';

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
    if (isMatch) {
      return {
        id: foundUser.id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        avatarUrl: foundUser.avatarUrl,
        refreshToken: await this.jwtService.signAsync(
          {
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

  async register(registerDto: RegisterDto) {
    const foundUser = await this.usersService.findOneByPhoneNumber(registerDto.phoneNumber);
    if (foundUser) {
      return { error: 'existed' };
    }

    const newUser = await this.usersService.create({
      phoneNumber: registerDto.phoneNumber,
      password: await hash(
        registerDto.password,
        +this.configService.get<number>('PASSWORD_SALT_ROUNDS'),
      ),
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });

    return {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      avatarUrl: newUser.avatarUrl,
      refreshToken: await this.jwtService.signAsync(
        {
          id: newUser.id,
          phoneNumber: newUser.phoneNumber,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
        {
          secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRE_DURATION'),
        },
      ),
    };
  }
}
