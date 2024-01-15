import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsersModel } from '../../users/entity/users.entity';
import { BaseModel } from '../../common/entity/base.entity';
import { IsString } from 'class-validator';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { Transform } from 'class-transformer';
import { POST_PUBLIC_IMAGE_PATH } from '../../common/const/path.const';
import { join } from 'path/posix';
import { ImagesModel } from '../../common/entity/images.entity';
import { CommentsModel } from '../comments/entity/comments.entity';

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

  // @Column({
  //   nullable: true,
  // })
  // @Transform(({ value }) => value && `/${join(POST_PUBLIC_IMAGE_PATH, value)}`)
  // image?: string;
  @OneToMany(() => ImagesModel, (image) => image.post)
  images: ImagesModel[]

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;

  @OneToMany(() => CommentsModel, (comment) => comment.post)
  comments: CommentsModel[];
}
