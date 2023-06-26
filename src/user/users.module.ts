import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UsersSeeder } from './users.seeder';
import { ConfigService } from '@nestjs/config';
import { UserController } from './user.controller';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UsersService, UsersSeeder, ConfigService],
  exports: [UsersService, SequelizeModule, UsersSeeder],
  controllers: [UserController],
})
export class UsersModule {}
