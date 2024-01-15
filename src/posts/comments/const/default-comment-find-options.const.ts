import { FindManyOptions } from 'typeorm';
import { CommentsModel } from '../entity/comments.entity';

export const DEFAULT_COMMENT_FIND_OPTIONS: FindManyOptions<CommentsModel> = {
  relations: {
    author: true,
  }
  // 스키마 변경했을 때 관리하기 용이함
}