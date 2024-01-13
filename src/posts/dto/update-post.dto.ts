import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional, IsString } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';

// Partial은 전부 다 옵셔널로 만들어주는 타입
export class UpdatePostDto extends PartialType(CreatePostDto) {
  // overriding 해가지고 재 작성해줘야하는ㄷㅅ
  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  title?: string;

  @IsString({
    message: stringValidationMessage,
  })
  @IsOptional()
  content?: string;
}
