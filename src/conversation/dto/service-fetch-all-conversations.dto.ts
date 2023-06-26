import { FetchAllConversationsDto } from './fetch-all-conversations.dto';

export class ServiceFetchAllConversationsDto extends FetchAllConversationsDto {
  user: { id: number };
}
