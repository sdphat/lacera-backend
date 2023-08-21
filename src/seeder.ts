import { seeder } from 'nestjs-seeder';
import { UsersSeeder } from './user/users.seeder';
import { SequelizeModule } from '@nestjs/sequelize';
import { UsersModule } from './user/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConversationModule } from './conversation/conversation.module';
import { ConversationsSeeder } from './conversation/conversation.seeder';
import { ContactsModule } from './contacts/contacts.module';
import { ContactsSeeder } from './contacts/contacts.seeder';
import { CacheModule } from '@nestjs/cache-manager';

seeder({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadModels: true,
        sync: {
          force: true,
        },
        define: {
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci',
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot(),
    UsersModule,
    ConversationModule,
    ContactsModule,
    CacheModule.register({ isGlobal: true }),
  ],
}).run([UsersSeeder, ConversationsSeeder, ContactsSeeder]);
