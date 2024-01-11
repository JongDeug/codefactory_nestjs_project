import {
    Body,
    Controller, Delete,
    Get,
    Param, ParseIntPipe,
    Post, Put,
} from '@nestjs/common';
import {PostsService} from './posts.service';


@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    // 1) GET /posts
    @Get()
    getPosts() {
        return this.postsService.getAllPosts();
    }

    // 2) GET /posts:id
    @Get(':id')
    getPost(@Param('id', ParseIntPipe) id: number) {
        return this.postsService.getPostById(id);
    }

    // 3) POST /posts
    @Post()
    postPosts(
        @Body('authorId') authorId: number,
        @Body('title') title: string,
        @Body('content') content: string,
    ) {
        return this.postsService.createPost(authorId, title, content);
    }

    // 4) PUT /posts/:id
    @Put(':id')
    putPost(
        @Param('id', ParseIntPipe) id: number,
        @Body('title') title?: string,
        @Body('content') content?: string,
    ) {
        return this.postsService.updatePost(id, title, content);
    }

    // 5) DELETE /posts/:id
    @Delete(':id')
    deletePost(@Param('id', ParseIntPipe) id: number) {
        return this.postsService.deletePost(id);
    }
}
