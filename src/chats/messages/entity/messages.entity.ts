import { BaseModel } from '../../../common/entity/base.entity';
import { ChatsModel } from '../../entity/chats.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { UsersModel } from '../../../users/entities/users.entity';
import { IsString } from 'class-validator';

@Entity()
export class MessagesModel extends BaseModel {
  // chat은 채팅방
  // message는 실제 메시지

  @ManyToOne(() => ChatsModel, (chat) => chat.messages)
  chat: ChatsModel;

  @ManyToOne(() => UsersModel, (user) => user.messages)
  author: UsersModel;

  @Column()
  @IsString()
  message: string;
}
