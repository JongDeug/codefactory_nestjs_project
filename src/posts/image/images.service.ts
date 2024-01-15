import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImagesModel } from '../../common/entity/images.entity';
import { QueryRunner, Repository } from 'typeorm';
import { basename, join } from 'path';
import {
  POST_IMAGE_PATH,
  TEMP_FOLDER_PATH,
} from '../../common/const/path.const';
import { promises } from 'fs';
import { CreatePostImageDto } from './dto/create-image.dto';
import { PostsModel } from '../entity/posts.entity';

@Injectable()
export class PostsImagesService {
  constructor(
    @InjectRepository(ImagesModel)
    private readonly imagesRepository: Repository<ImagesModel>,
  ) {}

  getRepository(qr?: QueryRunner) {
    return qr
      ? qr.manager.getRepository<ImagesModel>(ImagesModel)
      : this.imagesRepository;
  }

  async createPostImage(dto: CreatePostImageDto, qr?: QueryRunner) {
    const repository = this.getRepository(qr)
    // dto의 이미지 이름 기반으로 파일의 경로를 생성한다.
    const tempFilePath = join(TEMP_FOLDER_PATH, dto.path);

    try {
      // 파일이 존재하는지 확인
      await promises.access(tempFilePath);
    } catch (e) {
      throw new BadRequestException('존재하지 않는 파일 입니다. ');
    }

    // 파일의 이름만 가져오기
    // /Users/aa/bbb/vv/adf.jpg -> adf.jpg
    const fileName = basename(tempFilePath);

    // 새로 이동할 포스트 폴더의 경로 + 이미지 이름
    const newPath = join(POST_IMAGE_PATH, fileName);

    // 파일 옮기기 전에 save
    const result = await repository.save({
      ...dto,
    });

    // 파일 옮기기
    await promises.rename(tempFilePath, newPath);

    return result;
  }
}
