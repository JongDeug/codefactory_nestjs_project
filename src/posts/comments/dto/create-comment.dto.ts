import { PickType } from '@nestjs/mapped-types';
import { CommentsModel } from '../entity/comments.entity';

export class CreateCommentDto extends PickType(CommentsModel,['comment']){

}