export class CreateMessageDto {
  tempMessageId: number;
  conversationId: number;
  // reactions: Partial<Record<ReactionType, number>>;
  content: string;
  postDate: string;
}

export class CreateMessageServiceDto extends CreateMessageDto {
  userId: number;
}
