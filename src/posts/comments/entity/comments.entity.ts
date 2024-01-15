import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { BaseModel } from '../../../common/entity/base.entity';
import { UsersModel } from '../../../users/entity/users.entity';
import { PostsModel } from '../../entity/posts.entity';
import { IsNumber, IsString } from 'class-validator';
import { stringValidationMessage } from '../../../common/validation-message/string-validation.message';

@Entity()
export class CommentsModel extends BaseModel {
  @ManyToOne(() => UsersModel, (user) => user.comments)
  author: UsersModel;

  @ManyToOne(() => PostsModel, (post) => post.comments)
  post: PostsModel;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  comment: string;

  @Column({
    default: 0,
  })
  @IsNumber()
  likeCount: number;
}
