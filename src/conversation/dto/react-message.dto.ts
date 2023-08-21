import { ReactionType } from '../models/message-reaction.model';

export class ReactMessageDto {
  messageId: number;
  reactionType: ReactionType;
}
