import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {
  constructor(
    private readonly usersSerice: UsersService,
    private readonly configService: ConfigService,
  ) {}

  @Post('update-profile')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'background', maxCount: 1 },
    ]),
  )
  async upload(
    @Body() updateProfileDto: UpdateProfileDto,
    @Request() request: Request,
    @UploadedFiles() files: { avatar?: Express.Multer.File[]; background?: Express.Multer.File[] },
  ) {
    const user = request['user'] as any;

    // Save avatar image
    let publicAvatarUrl = '';
    if (files?.avatar) {
      const inputAvatar = files.avatar[0];
      publicAvatarUrl = join('images', `${randomUUID()}.${extname(inputAvatar.originalname)}`);
      const avatarFilePath = join('public', publicAvatarUrl);
      await writeFile(avatarFilePath, inputAvatar.buffer, { flag: 'w' });
    }

    // Save background image
    let publicBackgroundUrl = '';
    if (files?.background) {
      const inputBackground = files.background[0];
      publicBackgroundUrl = join(
        'images',
        `${randomUUID()}.${extname(inputBackground.originalname)}`,
      );
      const backgroundFilePath = join('public', publicBackgroundUrl);
      await writeFile(backgroundFilePath, inputBackground.buffer, { flag: 'w' });
    }

    const updateFields: any = {
      firstName: updateProfileDto.firstName,
      lastName: updateProfileDto.lastName,
      aboutMe: updateProfileDto.description,
    };

    if (publicAvatarUrl) {
      updateFields.avatarUrl = `${this.configService.get<string>('SELF_URL')}/${publicAvatarUrl}`;
    }

    if (publicBackgroundUrl) {
      updateFields.backgroundUrl = `${this.configService.get<string>(
        'SELF_URL',
      )}/${publicBackgroundUrl}`;
    }

    await this.usersSerice.update(user.id, updateFields);

    const updatedUser = await this.usersSerice.findOneById(user.id);
    return updatedUser;
  }
}
