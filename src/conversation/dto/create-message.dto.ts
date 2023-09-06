import { MessageType } from '../models/message.model';

export class CreateMessageDto {
  type: MessageType;
  tempMessageId: number;
  conversationId: number;
  content: string;
  postDate: string;
  replyTo?: number;
  fileName?: string;
}

export class CreateMessageServiceDto extends CreateMessageDto {
  userId: number;
}
