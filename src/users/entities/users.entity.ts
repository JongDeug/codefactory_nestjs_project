import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostsModel } from '../../posts/entities/posts.entity';
import { RolesEnum } from '../const/roles.const';
import { BaseModel } from '../../common/entity/base.entity';
import {
  IsEmail,
  IsString,
  Length,
  ValidationArguments,
} from 'class-validator';
import { lengthValidationMessage } from '../../common/validation-message/length-validation.message';
import { stringValidationMessage } from '../../common/validation-message/string-validation.message';
import { emailValidationMessage } from '../../common/validation-message/email-validation.message';
import { Exclude, Expose } from 'class-transformer';

@Entity()
// @Exclude()
export class UsersModel extends BaseModel {
  // @PrimaryGeneratedColumn()
  // id: number;
  //
  @Column({
    length: 20, // 1) 길이가 20을 넘지 않을 것
    unique: true, // 2) 유일무이한 값이 될 것
  })
  @IsString({
    message: stringValidationMessage,
  })
  @Length(1, 20, {
    message: lengthValidationMessage,
  })
  // @Expose()
  nickname: string;

  // // TEST
  // @Expose() // 노출시키다, 폭로하다 // 실제 존재하지 않는 데이터를 expose 시킬 수 있음.
  // get nicknameAndEmail() {
  //   return this.nickname + '/' + this.email;
  // }

  @Column({
    unique: true, // 1) 유일무이한 값이 될 것
  })
  @IsString({
    message: stringValidationMessage,
  })
  @IsEmail(
    {},
    {
      message: emailValidationMessage,
    },
  )
  email: string;

  @Column()
  @IsString({
    message: stringValidationMessage,
  })
  @Length(3, 8, {
    message: lengthValidationMessage,
  })
  /**
   * REQUEST
   * frontend -> backend
   * plain object(JSON) -> class instance(DTO)
   *
   * RESPONSE
   * backend -> frontend
   * class instance(DTO) -> plain object(JSON)
   *
   * toClassOnly -> class instance로 변환될 때만
   * toPlainOnly -> plain object로 변환될 때만
   *
   * 옵션이 없으면 두 가지 모두 적용.
   * 하지만, 우리는 입력은 받아야 하므로 toPlainOnly(응답만)
   */
  @Exclude({
    toPlainOnly: true,
  })
  password: string;

  @Column({
    enum: Object.values(RolesEnum), // enum값 지정 방법
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  @OneToMany(() => PostsModel, (post) => post.author)
  posts: PostsModel[];

  //
  // @UpdateDateColumn()
  // updatedAt: Date
  //
  // @CreateDateColumn()
  // createdAt: Date
}
