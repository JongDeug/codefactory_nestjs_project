import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostsModel } from '../../posts/entities/posts.entity';
import { RolesEnum } from '../const/roles.const';

@Entity()
export class UsersModel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20, // 1) 길이가 20을 넘지 않을 것
    unique: true, // 2) 유일무이한 값이 될 것
  })
  nickname: string;

  @Column({
    unique: true, // 1) 유일무이한 값이 될 것
  })
  email: string;

  @Column()
  password: string;

  @Column({
    enum: Object.values(RolesEnum), // enum값 지정 방법
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author, {
    eager: true,
  })
  posts: PostsModel[];
}
