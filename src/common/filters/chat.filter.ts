import { HttpException } from '@nestjs/common';
import { FileFilterCallback } from 'multer';

export const chatRoomAvatarFileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
    return callback(new HttpException('Only image files are allowed!', 422));
  }
  callback(null, true);
};
