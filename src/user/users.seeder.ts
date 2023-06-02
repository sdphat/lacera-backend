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
    await this.userModel.sync({ force: true });
    return this.userModel.create<User>({
      phoneNumber: '+84784030266',
      password: hashSync('12345678', this.configService.get<number>('PASSWORD_SALT_ROUNDS')),
    });
  }
  async drop(): Promise<any> {
    return;
  }
}
