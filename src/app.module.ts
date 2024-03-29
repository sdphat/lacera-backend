import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccessTokenAuthGuard } from './auth/accessToken.guard';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from './user/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConversationModule } from './conversation/conversation.module';
import { ContactsModule } from './contacts/contacts.module';
import { CacheModule } from '@nestjs/cache-manager';
import { FileUploadService } from './services/FileUploadService';
import { EncryptionService } from './services/EncryptionService';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        uri: configService.get<string>('DB_CONNECTION_STRING'),
        autoLoadModels: true,
        dialectOptions: {
          ssl: {
            required: true,
          },
        },
        synchronize: true,
        define: {
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci',
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    ConfigModule.forRoot(),
    UsersModule,
    ConversationModule,
    ContactsModule,
    CacheModule.register({ isGlobal: true }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenAuthGuard,
    },
    FileUploadService,
    EncryptionService,
  ],
})
export class AppModule {}
