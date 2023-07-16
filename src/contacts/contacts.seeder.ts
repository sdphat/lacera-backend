import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Friend } from '../user/models/friend.model';
import { Seeder } from 'nestjs-seeder';

@Injectable()
export class ContactsSeeder implements Seeder {
  constructor(@InjectModel(Friend) private readonly friendModel: typeof Friend) {}
  async seed(): Promise<any> {
    await this.friendModel.bulkCreate([
      {
        userId: 1,
        friendId: 2,
      },
      {
        userId: 1,
        friendId: 3,
      },
      {
        userId: 2,
        friendId: 3,
      },
    ]);
  }
  async drop(): Promise<any> {
    return;
  }
}
