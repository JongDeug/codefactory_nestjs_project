import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersModel } from '../../users/entities/users.entity';

@Entity()
export class PostsModel {
  // Primary column을 꼭 가지고 있어야함.
  @PrimaryGeneratedColumn()
  id: number;

  // 반대쪽 입장에서 "나"를 가져오려면 무엇을 선택해야 하는가?
  @ManyToOne(() => UsersModel, (user) => user.posts, {
    nullable: false, // null이 될 수 없다.
  })
  author: UsersModel;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  likeCount: number;

  @Column()
  commentCount: number;
}
