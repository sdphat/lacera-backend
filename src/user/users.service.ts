import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { FindUserConversationsDto } from './dto/find-user-conversations.dto';
import { Conversation } from '../conversation/models/conversation.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) {}
  create(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
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
