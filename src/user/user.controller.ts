import { Controller, Get, Post, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('conversations')
  async getConversations(@Req() req) {
    const user = req.user;
    return this.usersService.findAllConversation({ userId: user.id });
  }
}
