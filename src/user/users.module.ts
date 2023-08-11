import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { UsersSeeder } from './users.seeder';
import { ConfigService } from '@nestjs/config';
import { Friend } from './models/friend.model';
import { UserGateway } from './user.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SequelizeModule.forFeature([User, Friend]), JwtModule],
  providers: [UsersService, UsersSeeder, ConfigService, UserGateway],
  exports: [UsersService, SequelizeModule, UsersSeeder],
})
export class UsersModule {}
