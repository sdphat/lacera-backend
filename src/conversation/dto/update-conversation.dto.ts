import { PartialType } from '@nestjs/mapped-types';
import { CreatePrivateConversationDto } from './create-private-conversation.dto';

export class UpdateConversationDto extends PartialType(CreatePrivateConversationDto) {}
