import { Controller, Post, Body, Res, HttpStatus, HttpCode, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { Public } from './accessToken.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request) {
    console.warn('Running mock up logout function');
    const user = request.user;
    return;
  }
}
