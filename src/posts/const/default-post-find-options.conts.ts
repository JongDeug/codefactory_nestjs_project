import { FindManyOptions } from 'typeorm';
import { PostsModel } from '../entity/posts.entity';

export const DEFAULT_POST_FIND_OPTIONS: FindManyOptions<PostsModel> = {
  relations: [
    'author',
    'images',
    'comments'
  ]
}