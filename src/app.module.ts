import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModel } from './posts/entities/posts.entity';
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entities/users.entity';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
  ENV_HOST_KEY,
} from './common/const/env-keys.const';
import { ServeStaticModule } from '@nestjs/serve-static';
import { PROJECT_ROOT_PATH, PUBLIC_FOLDER_PATH } from './common/const/path.const';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      // rootPath를 http://localhost:3000/public/ 이렇게 설정해서
      // 이미지를 얻기 위해 http://localhost:3000/posts/4022.jpg 이렇게 요청을 해야됨. 근데 이러면 다른 엔드포인트랑 겹쳐서 삐-삐
      rootPath: PUBLIC_FOLDER_PATH,
      // 그래서 serveRoot를 굳이! 추가하여 이렇게 요청하게끔 만들어주는거임 -> http://localhost:3000/public/posts/4022.jpg
      serveRoot: '/public',
      // 이건 이해가 좀 안되네 ;; public_folder_path가 ~/public 인데, 흠.
    }),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // TypeORM 모듈 추가
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env[ENV_DB_HOST_KEY],
      port: parseInt(process.env[ENV_DB_PORT_KEY]),
      username: process.env[ENV_DB_USERNAME_KEY],
      password: process.env[ENV_DB_PASSWORD_KEY],
      database: process.env[ENV_DB_DATABASE_KEY],
      entities: [PostsModel, UsersModel],
      synchronize: true,
      // 개발할 때만 true, 실제 프로덕션은 false
    }),
    PostsModule,
    UsersModule,
    AuthModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
