import { Controller, Post, Body, Res, HttpStatus, HttpCode, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { Public } from './accessToken.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
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
    return result;
  }
}
