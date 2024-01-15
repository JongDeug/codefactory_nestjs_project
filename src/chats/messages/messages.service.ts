import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessagesModel } from './entity/messages.entity';
import { Repository } from 'typeorm';
import { CommonService } from '../../common/common.service';

@Injectable()
export class ChatsMessagesService {
  constructor(
    @InjectRepository(MessagesModel)
    private readonly messageRepository: Repository<MessagesModel>,
    private readonly commonService: CommonService,
  ) {}


}