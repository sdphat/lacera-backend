import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../services/FileUploadService';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly fileUploadService: FileUploadService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file) {
    const fileUrl = await this.fileUploadService.upload(file);
    return fileUrl;
  }
}
