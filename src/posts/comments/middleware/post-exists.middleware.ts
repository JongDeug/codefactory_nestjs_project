import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Response, Request } from 'express';
import { PostsService } from '../../posts.service';

@Injectable()
export class PostExistsMiddleware implements NestMiddleware {
  constructor(private readonly postService: PostsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const postId = req.params.postId;

    if (!postId) {
      throw new BadRequestException('Post Id 파라미터는 필수입니다.');
    }

    const exists = await this.postService.checkPostExistsById(parseInt(postId));

    if (!exists) {
      throw new BadRequestException('Post가 존재하지 않습니다.');
    }

    next();
  }
}
