import { Body, Controller, Post, UploadedFiles, UseInterceptors, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ConfigService } from '@nestjs/config';
import { FileUploadService } from 'src/services/FileUploadService';

@Controller('user')
export class UserController {
  constructor(
    private readonly usersSerice: UsersService,
    private readonly configService: ConfigService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post('update-profile')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'background', maxCount: 1 },
    ]),
  )
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() request: Request,
    @UploadedFiles() files: { avatar?: Express.Multer.File[]; background?: Express.Multer.File[] },
  ) {
    const user = request['user'] as any;

    const updateFields: any = {
      firstName: updateProfileDto.firstName,
      lastName: updateProfileDto.lastName,
      aboutMe: updateProfileDto.description,
    };

    // Save avatar image
    if (files?.avatar) {
      const inputAvatar = files.avatar[0];
      const avatarFilePath = await this.fileUploadService.upload(inputAvatar);
      updateFields.avatarUrl = avatarFilePath;
    }

    // Save background image
    if (files?.background) {
      const inputBackground = files.background[0];
      const backgroundFilePath = await this.fileUploadService.upload(inputBackground);
      updateFields.backgroundUrl = backgroundFilePath;
    }

    await this.usersSerice.update(user.id, updateFields);

    const updatedUser = await this.usersSerice.findOneById(user.id);
    return updatedUser;
  }
}
