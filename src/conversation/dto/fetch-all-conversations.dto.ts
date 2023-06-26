export class FetchAllConversationsQuery {
  conversationId: number;
  fetchFromId: number;
}

export class FetchAllConversationsDto {
  query?: FetchAllConversationsQuery[];
}
