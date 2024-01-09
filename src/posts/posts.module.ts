import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

// 인스턴스 대신 클래스를 그대로 넣음. why?
// 모듈이 생성되는 순간에 클래스를 생성하고 싶은게 아니고,
// IoC Container가 자동으로 인스턴스화 하고 관리하는 것을 원하니깐.
@Module({
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
