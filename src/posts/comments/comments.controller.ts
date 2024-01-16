import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommonService } from '../../common/common.service';
import { PaginateCommentDto } from './dto/paginate-comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../../users/decorator/users.decorator';
import { AccessTokenGuard } from '../../auth/guard/bearer-token.guard';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { IsPublic } from '../../common/decorator/is-public.decorator';
import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin.guard';
import { TransactionInterceptor } from '../../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../../common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';
import { PostsService } from '../posts.service';

@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly postsService: PostsService,
  ) {
    /**
     * 1) Entity 생성
     * author
     * post
     * comment
     * likeCount
     * BaseModel
     *
     * 2) Get()
     * 3) Get(':commentId') 특정 comment만 하나 가져오는 기능
     * 4) Post() 코멘트 생성하는 기능
     * 5) Patch(':commentId') 특정 코멘트 업데이트
     * 6) DELETE(':commentId') 특정 코멘트 삭제하는 기능
     */
  }

  @Get()
  @IsPublic()
  getComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() dto: PaginateCommentDto,
  ) {
    return this.commentsService.paginateComments(postId, dto);
  }

  @Get(':commentId')
  @IsPublic()
  getComment(@Param('commentId') id: number) {
    return this.commentsService.getCommentById(id);
  }

  @Post()
  // @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async postComments(
    @User('id') authorId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
    @QueryRunner() qr: QR,
  ) {
    await this.commentsService.createComment(authorId, postId, dto, qr);
    await this.postsService.incrementCommentCount(postId, qr);
    // return true;
  }

  @Patch(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  patchComments(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(commentId, dto);
  }

  @Delete(':commentId')
  @UseGuards(IsCommentMineOrAdminGuard)
  @UseInterceptors(TransactionInterceptor)
  async deleteComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Param('postId', ParseIntPipe) postId: number,
    @QueryRunner() qr: QR,
  ) {
    await this.commentsService.deleteComment(commentId);
    await this.postsService.decrementCommentCount(postId, qr);
    return true;
  }
}
