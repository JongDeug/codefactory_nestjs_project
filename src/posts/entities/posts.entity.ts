import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersModel } from '../../users/entities/users.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsString } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';

@Entity()
export class PostsModel extends BaseModel {
  // Primary column을 꼭 가지고 있어야함.
  // @PrimaryGeneratedColumn()
  // id: number;
  //
  // 반대쪽 입장에서 "나"를 가져오려면 무엇을 선택해야 하는가?
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false, // null이 될 수 없다.
  })
  author: UsersModel;


  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  title: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
