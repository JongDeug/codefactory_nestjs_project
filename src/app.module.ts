import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {PostsModule} from './posts/posts.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {PostsModel} from "./posts/entities/posts.entity";
import { UsersModule } from './users/users.module';
import { UsersModel } from './users/entities/users.entity';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        // TypeORM 모듈 추가
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: '127.0.0.1',
            port: 5432,
            username: 'postgres',
            password: 'postgres',
            database: 'postgres',
            entities: [PostsModel, UsersModel],
            synchronize: true,
            // 개발할 때만 true, 실제 프로덕션은 false
        }),
        PostsModule,
        UsersModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
