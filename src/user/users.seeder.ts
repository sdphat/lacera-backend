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
      firstName: 'Jessica',
      lastName: 'Patel',
      lastActive: new Date(2023, 7, 20, 13),
      avatarUrl: '/photo-1534528741775-53994a69daeb.jpg',
      backgroundUrl: '/background.jpg',
      aboutMe: `Hi there! I'm Jessica, a dynamic and creative marketing professional with a passion for all things related to branding and digital marketing. Born and raised in a culturally diverse city, I've always appreciated the value of different perspectives and enjoy connecting with people from various backgrounds.`,
    });
    await this.userModel.create<User>({
      phoneNumber: '+841234567',
      password: hashSync('12345678', +this.configService.get<number>('PASSWORD_SALT_ROUNDS')),
      firstName: 'Samantha',
      lastName: 'Davis',
      lastActive: new Date(2023, 7, 20, 11, 19),
      avatarUrl: '/avatar_2.png',
      backgroundUrl: '/background.jpg',
      aboutMe: `Hello there! I'm Samantha, a curious and enthusiastic individual with a passion for exploring the world and embracing new experiences. I believe in living life to the fullest, constantly seeking opportunities to learn and grow. My insatiable curiosity often leads me down various paths, from delving into fascinating books to trying out different hobbies and engaging in meaningful conversations with people from all walks of life.`,
    });
    await this.userModel.create<User>({
      phoneNumber: '+84111111',
      password: hashSync('12345678', +this.configService.get<number>('PASSWORD_SALT_ROUNDS')),
      firstName: 'James',
      lastName: 'Jameron',
      lastActive: new Date(2023, 7, 11, 13, 11),
      avatarUrl: '/photo-1534528741775-53994a69daeb.jpg',
      backgroundUrl: '/background_2.jpg',
      aboutMe: `Hello, I'm James`,
    });
  }
  async drop(): Promise<any> {
    return;
  }
}
