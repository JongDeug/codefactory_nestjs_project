import { BadRequestException, Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import * as multer from 'multer';
import {
  POST_IMAGE_PATH,
  TEMP_FOLDER_NAME,
  TEMP_FOLDER_PATH,
} from './const/path.const';
import { v4 as uuid } from 'uuid';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { PostsModel } from '../posts/entity/posts.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        // 바이트 단위로 입력 10MB
        fileSize: 10000000,
      },
      // callback(에러, 파일을 받을지 말지 boolean)
      fileFilter: (req, file, callback) => {
        // xxx.jpg -> .jpg, 확장자만 따옴
        const ext = extname(file.originalname);

        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
          callback(
            new BadRequestException('jpg/jpeg/png 파일만 업로드 가능합니다!'),
            false,
          );
        }

        callback(null, true);
      },
      storage: multer.diskStorage({
        destination: function (req, file, callback) {
          callback(null, TEMP_FOLDER_PATH);
        },
        filename: function (req, file, callback) {
          // 1231231-123-123123-123123.png
          callback(null, `${uuid()}${extname(file.originalname)}`);
        },
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [CommonController],
  exports: [CommonService],
  providers: [CommonService],
})
export class CommonModule {}
