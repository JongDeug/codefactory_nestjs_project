import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CommentsModel } from './entity/comments.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from '../../common/common.service';
import { PaginateCommentDto } from './dto/paginate-comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { DEFAULT_COMMENT_FIND_OPTIONS } from './const/default-comment-find-options.const';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentsModel)
    private readonly commentsRepository: Repository<CommentsModel>,
    private readonly commonService: CommonService,
  ) {}

  async paginateComments(postId: number, query: PaginateCommentDto) {
    return this.commonService.paginate(
      query,
      this.commentsRepository,
      {
        where: {
          post: {
            id: postId,
          },
        },
        ...DEFAULT_COMMENT_FIND_OPTIONS,
      },
      `comments/${postId}/comments`,
    );
  }

  async getCommentById(id: number) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id,
      },
      ...DEFAULT_COMMENT_FIND_OPTIONS,
    });

    if (!comment) {
      throw new NotFoundException(`id : ${id} Comment는 존재하지 않습니다.`);
    }

    return comment;
  }

  async createComment(authorId: number, postId: number, dto: CreateCommentDto) {
    const comment = this.commentsRepository.create({
      author: {
        id: authorId,
      },
      post: {
        id: postId,
      },
      ...dto,
      likeCount: 0,
    });

    const newComment = await this.commentsRepository.save(comment);
    return newComment;
  }

  async updateComment(commentId: number, dto: UpdateCommentDto) {
    // preload
    // 입력된 값을 기반으로 데이터베이스에 있는 데이터를 불러오고
    // 추가 입력된 값으로 데이터베이스에서 가져온 값들을 대체함.
    const comment = await this.commentsRepository.preload({
      id: commentId,
      ...dto,
    });

    const newComment = await this.commentsRepository.save(comment);
    return newComment;
  }

  async deleteComment(commentId: number) {
    const comment = await this.commentsRepository.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new NotFoundException();
    }

    await this.commentsRepository.delete(commentId);
    return commentId;
  }
}
