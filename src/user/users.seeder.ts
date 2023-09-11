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
      phoneNumber: '+849999999',
      password: hashSync('12345678', +this.configService.get<number>('PASSWORD_SALT_ROUNDS')),
      firstName: 'Jessica',
      lastName: 'Patel',
      lastActive: new Date(2023, 7, 20, 13),
      // eslint-disable-next-line prettier/prettier
      avatarUrl: `${this.configService.get<string>('SELF_URL')}/photo-1534528741775-53994a69daeb.jpg`,
      backgroundUrl: `${this.configService.get<string>('SELF_URL')}/background.jpg`,
      aboutMe: `Hi there! I'm Jessica, a dynamic and creative marketing professional with a passion for all things related to branding and digital marketing.`,
    });
    await this.userModel.create<User>({
      phoneNumber: '+841234567',
      password: hashSync('12345678', +this.configService.get<number>('PASSWORD_SALT_ROUNDS')),
      firstName: 'Samantha',
      lastName: 'Davis',
      lastActive: new Date(2023, 7, 20, 11, 19),
      avatarUrl: `${this.configService.get<string>('SELF_URL')}/avatar_2.png`,
      backgroundUrl: `${this.configService.get<string>('SELF_URL')}/background.jpg`,
      aboutMe: `Hello there! I'm Samantha, a curious and enthusiastic individual with a passion for exploring the world and embracing new experiences.`,
    });
    await this.userModel.create<User>({
      phoneNumber: '+84111111',
      password: hashSync('12345678', +this.configService.get<number>('PASSWORD_SALT_ROUNDS')),
      firstName: 'James',
      lastName: 'Jameron',
      lastActive: new Date(2023, 7, 11, 13, 11),
      // eslint-disable-next-line prettier/prettier
      avatarUrl: `${this.configService.get<string>('SELF_URL')}/photo-1534528741775-53994a69daeb.jpg`,
      backgroundUrl: `${this.configService.get<string>('SELF_URL')}/background_2.jpg`,
      aboutMe: `Hello, I'm James`,
    });
  }
  async drop(): Promise<any> {
    return;
  }
}
