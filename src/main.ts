import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // posts/dto/create-post.dto.ts에서 @IsString() 같은 validate들을 글로벌 하게 실행해주는 코드.
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}

bootstrap();
