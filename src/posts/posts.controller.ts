import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards, UseInterceptors,
  Request, InternalServerErrorException, UseFilters, HttpException, BadRequestException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { UsersModel } from '../users/entities/users.entity';
import { User } from '../users/decorator/users.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { ImageModelType } from '../common/entity/images.entity';
import { DataSource, QueryRunner as QR } from 'typeorm';
import { PostsImagesService } from './image/images.service';
import { LogInterceptor } from '../common/interceptor/log.interceptor';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { QueryRunner } from '../common/decorator/query-runner.decorator';
import { HttpExceptionFilter } from '../common/exception-filter/http.exception-filter';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly dataSource: DataSource,
    private readonly postsImagesService: PostsImagesService,
  ) {}

  // 1) GET /posts
  @Get()
  // @UseInterceptors(LogInterceptor)
  // @UseFilters(HttpExceptionFilter)
  getPosts(@Query() query: PaginatePostDto) {
    // Exception 필터 적용했을 때 다르게 나옴!!
    // throw new BadRequestException('exception test');

    // return this.postsService.getAllPosts();
    return this.postsService.paginatePosts(query);
  }

  @Post('/random')
  @UseGuards(AccessTokenGuard)
  async postPostRandom(@User() user: UsersModel) {
    await this.postsService.generatePosts(user.id);

    return true;
  }

  // 2) GET /posts:id
  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.getPostById(id, null);
  }

  // 3) POST /posts
  // @User decorator을 사용하려면 반드시 AccessTokenGuard를 거쳐야 함.
  // DTO - Data Transfer Object
  @Post()
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(TransactionInterceptor)
  async postPosts(
    @User('id') userId: number,
    // @Body('title') title: string,
    // @Body('content') content: string,
    @Body() body: CreatePostDto,
    @QueryRunner() qr: QR,
  ) {
      const post = await this.postsService.createPost(userId, body, qr);


      for (let i = 0; i < body.images.length; i++) {
        await this.postsImagesService.createPostImage(
          {
            post,
            order: i,
            path: body.images[i],
            type: ImageModelType.POST_IMAGE,
          },
          qr,
        );
      }

      return this.postsService.getPostById(post.id, qr);
  }

  // @Post()
  // @UseGuards(AccessTokenGuard)
  // postPosts(
  //   @User() user: UsersModel,
  //   @Body('title') title: string,
  //   @Body('content') content: string,
  // ) {
  //   return this.postsService.createPost(user.id, title, content);
  // }

  // 4) PATCH /posts/:id
  @Patch(':id')
  patchPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePostDto,
    // @Body('title') title?: string,
    // @Body('content') content?: string,
  ) {
    return this.postsService.updatePost(id, body);
  }

  // 5) DELETE /posts/:id
  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.deletePost(id);
  }
}
