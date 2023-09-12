import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private readonly configService: ConfigService,
  ) {}
  create(createUserDto: CreateUserDto) {
    return this.userModel.create({
      ...createUserDto,
      avatarUrl: `${this.configService.get<string>('SELF_URL')}/placeholder_avatar.png`,
      backgroundUrl: `${this.configService.get<string>('SELF_URL')}/placeholder_background.jpg`,
    });
  }

  async findOneById(id: number) {
    return this.userModel.findByPk(id);
  }

  async findOneByPhoneNumber(phoneNumber: string) {
    return this.userModel.findOne({ where: { phoneNumber } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.userModel.update(updateUserDto, {
      where: {
        id,
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
