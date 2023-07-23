import { UserAttributes } from '../models/user.model';

export class UpdateUserDto implements Partial<Omit<UserAttributes, 'id'>> {
  aboutMe?: string;
  password?: string;
  lastName?: string;
  lastActive?: Date;
  phoneNumber?: string;
  avatarUrl?: string;
  backgroundUrl?: string;
  firstName?: string;
  online?: boolean;
}
