import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from '../user/users.module';
import { ContactsGateway } from './contacts.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { ContactsSeeder } from './contacts.seeder';

@Module({
  imports: [SequelizeModule, UsersModule, JwtModule.register({}), ConfigModule],
  providers: [ContactsService, ContactsGateway, ContactsSeeder],
  exports: [SequelizeModule, ContactsSeeder],
})
export class ContactsModule {}
