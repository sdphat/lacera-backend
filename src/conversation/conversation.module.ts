import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Conversation } from './models/conversation.model';
import { ConversationUser } from './models/conversation-user.model';
import { UsersModule } from '../user/users.module';
import { UsersService } from '../user/users.service';
import { ConversationGateway } from './conversation.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { Message } from './models/message.model';
import { MessageService } from './message.service';
import { MessageUser } from './models/message-recipient.model';
import { MessageReaction } from './models/message-reaction.model';
import { ConversationController } from './conversation.controller';
import { FileUploadService } from 'src/services/FileUploadService';

@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule,
    UsersModule,
    SequelizeModule.forFeature([
      Conversation,
      ConversationUser,
      Message,
      MessageUser,
      MessageReaction,
    ]),
  ],
  providers: [
    ConversationService,
    UsersService,
    ConversationGateway,
    MessageService,
    FileUploadService,
  ],
  exports: [SequelizeModule],
  controllers: [ConversationController],
})
export class ConversationModule {}
