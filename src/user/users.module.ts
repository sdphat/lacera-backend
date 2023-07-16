import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UsersSeeder } from './users.seeder';
import { ConfigService } from '@nestjs/config';
import { UserController } from './user.controller';
import { Friend } from './models/friend.model';

@Module({
  imports: [SequelizeModule.forFeature([User, Friend])],
  providers: [UsersService, UsersSeeder, ConfigService],
  exports: [UsersService, SequelizeModule, UsersSeeder],
  controllers: [UserController],
})
export class UsersModule {}
