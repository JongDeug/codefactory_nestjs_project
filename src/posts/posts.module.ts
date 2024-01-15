import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './entities/posts.entity';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { ImagesModel } from '../common/entity/images.entity';
import { PostsImagesService } from './image/images.service';
import { LogMiddleware } from '../common/middleware/log.middleware';

// 인스턴스 대신 클래스를 그대로 넣음. why?
// 모듈이 생성되는 순간에 클래스를 생성하고 싶은게 아니고,
// IoC Container가 자동으로 인스턴스화 하고 관리하는 것을 원하니깐.
@Module({
  imports: [
    TypeOrmModule.forFeature([PostsModel, ImagesModel]),
    UsersModule,
    AuthModule,
    CommonModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsImagesService],
})
export class PostsModule {}
