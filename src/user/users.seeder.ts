import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { Seeder } from 'nestjs-seeder';
import { hashSync } from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersSeeder implements Seeder {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly configService: ConfigService,
  ) {}
  async seed(): Promise<any> {
    await this.userModel.create<User>({
      phoneNumber: '+84784030266',
      password: hashSync('12345678', +this.configService.get<number>('PASSWORD_SALT_ROUNDS')),
      firstName: 'John',
      lastName: 'Smith',
      lastActive: new Date(2023, 7, 20, 13),
      avatarUrl: '/photo-1534528741775-53994a69daeb.jpg',
    });
    await this.userModel.create<User>({
      phoneNumber: '+841234567',
      password: hashSync('12345678', +this.configService.get<number>('PASSWORD_SALT_ROUNDS')),
      firstName: 'Jane',
      lastName: 'Doe',
      lastActive: new Date(2023, 7, 20, 11, 19),
      avatarUrl: '/avatar_2.png',
    });
    await this.userModel.create<User>({
      phoneNumber: '+84111111',
      password: hashSync('12345678', +this.configService.get<number>('PASSWORD_SALT_ROUNDS')),
      firstName: 'James',
      lastName: 'Jameron',
      lastActive: new Date(2023, 7, 11, 13, 11),
      avatarUrl: '/photo-1534528741775-53994a69daeb.jpg',
    });
  }
  async drop(): Promise<any> {
    return;
  }
}
