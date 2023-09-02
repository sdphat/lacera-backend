export class CreateMessageDto {
  tempMessageId: number;
  conversationId: number;
  content: string;
  postDate: string;
  replyTo?: number;
}

export class CreateMessageServiceDto extends CreateMessageDto {
  userId: number;
}
