import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  Request,
  Patch,
  Query, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '../auth/guard/bearer-token.guard';
import { UsersModel } from '../users/entities/users.entity';
import { User } from '../users/decorator/users.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginatePostDto } from './dto/paginate-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // 1) GET /posts
  @Get()
  getPosts(@Query() query: PaginatePostDto) {
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
    return this.postsService.getPostById(id);
  }

  // 3) POST /posts
  // @User decorator을 사용하려면 반드시 AccessTokenGuard를 거쳐야 함.
  // DTO - Data Transfer Object
  @Post()
  @UseGuards(AccessTokenGuard)
  async postPosts(
    @User('id') userId: number,
    // @Body('title') title: string,
    // @Body('content') content: string,
    @Body() body: CreatePostDto,
  ) {
    await this.postsService.createPostImage(body)
    return this.postsService.createPost(userId, body);
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
