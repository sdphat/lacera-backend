import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import { extname, join } from 'path';

@Injectable()
export class FileUploadService {
  constructor(private readonly configService: ConfigService) {}
  /**
   * Upload a file
   * @param file File to save.
   * @param fileName At rest file name. Random name is assigned if not specified.
   * @returns Public url of the file for client to refer to
   */
  async upload(file: Express.Multer.File, fileName?: string) {
    const _fileName = fileName ?? `${randomUUID()}.${extname(file.originalname)}`;
    const fileBuffer = file.buffer;
    const filePath = join('public', _fileName);
    await writeFile(filePath, fileBuffer, { flag: 'w' });
    const publicUrl = `${this.configService.get<string>('SELF_URL')}/${_fileName}`;
    return publicUrl;
  }
}
