import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // posts/dto/create-post.dto.ts에서 @IsString() 같은 validate들을 글로벌 하게 실행해주는 코드.
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // paginate-post.dtd.ts 에서 기본값을 적용하게 하기 위해 씀
      transformOptions: {
        enableImplicitConversion: true, // transform이 될 때 class validator 기반으로 임의로 변환시켜줌
      },
      whitelist: true, // paginate-post dto에서 정하지 않은 프로퍼티들 다 못들어오게함 strip함
      forbidNonWhitelisted: true, // true가 되면 strip 대신에 에러를 던진다.
    }),
  );

  await app.listen(3000);
}

bootstrap();
