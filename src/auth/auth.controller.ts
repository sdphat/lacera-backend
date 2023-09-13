import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  HttpCode,
  Req,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { Public } from './accessToken.guard';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../user/users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { makeUserRedisOnlineKey } from '../utils';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Public()
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(@Req() request) {
    const result = await this.authService.refreshAccessToken(request.user);
    return result;
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(loginDto);
    if (result.error === 'mismatch') {
      response.statusCode = 400;
      return result;
    }
    if (!('error' in result)) {
      await this.cacheManager.set(makeUserRedisOnlineKey(result.id), true, 5000);
    }
    return result;
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(registerDto);
    if (result.error === 'existed') {
      response.statusCode = 400;
      return { error: 'existed' };
    }
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request) {
    const user = (request as any).user;
    try {
      this.usersService.update(user.id, { online: false, lastActive: new Date() });
    } catch (ex) {
      console.log(ex);
    }
    await this.cacheManager.del(makeUserRedisOnlineKey(user.userId));
  }
}
