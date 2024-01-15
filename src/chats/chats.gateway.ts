import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { EnterChatDto } from './dto/enter-chat.dto';
import { CreateMessagesDto } from './dto/create-messages.dto';
import { ChatsMessagesService } from './messages/messages.service';
import {
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SocketCatchHttpExceptionFilter } from '../common/exception-filter/socket-catch-http.exception-filter';
import { SocketBearerTokenGuard } from '../auth/guard/socket/socket-bearer-token.guard';
import { UsersModel } from '../users/entity/users.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  namespace: 'chats', // ws://localhost:3000/chats, 카카오톡 서비스 전체라고 생각
})
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: ChatsMessagesService,
    private readonly autService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer()
  server: Server; // server(3000)

  afterInit(server: any): any {
    console.log(`after gateway init`);
  }

  handleDisconnect(socket: Socket): any {
    console.log(`on disconnect called : ${socket.id}`);
  }

  // 가드를 모두 적용할 필요없이 여기에만 적용하고 쭉 적용하면됨
  async handleConnection(socket: Socket & { user: UsersModel }) {
    console.log(`on connect called : ${socket.id}`);

    const headers = socket.handshake.headers;

    const rawToken = headers['authorization'];

    if (!rawToken) {
      // throw new WsException('토큰이 없습니다!');
      socket.disconnect();
    }

    try {
      const token = this.autService.extractTokenFromHeader(rawToken, true);

      const payload = this.autService.verifyToken(token);
      const user = await this.usersService.getUserByEmail(payload.email);

      socket.user = user;

      return true;
    } catch (e) {
      // throw new WsException('토큰이 유효하지 않습니다.');
      socket.disconnect();
    }
  }

  @UsePipes(
    new ValidationPipe({
      transform: true, // paginate-post.dtd.ts 에서 기본값을 적용하게 하기 위해 씀
      transformOptions: {
        enableImplicitConversion: true, // transform이 될 때 class validator 기반으로 임의로 변환시켜줌
      },
      whitelist: true, // paginate-post dto에서 정하지 않은 프로퍼티들 다 못들어오게함 strip함
      forbidNonWhitelisted: true, // true가 되면 strip 대신에 에러를 던진다.
    }),
  )
  @UseFilters(SocketCatchHttpExceptionFilter)
  // @UseGuards(SocketBearerTokenGuard)
  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() dto: CreateChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chat = await this.chatsService.createChat(dto);
  }

  @UsePipes(
    new ValidationPipe({
      transform: true, // paginate-post.dtd.ts 에서 기본값을 적용하게 하기 위해 씀
      transformOptions: {
        enableImplicitConversion: true, // transform이 될 때 class validator 기반으로 임의로 변환시켜줌
      },
      whitelist: true, // paginate-post dto에서 정하지 않은 프로퍼티들 다 못들어오게함 strip함
      forbidNonWhitelisted: true, // true가 되면 strip 대신에 에러를 던진다.
    }),
  )
  // @UseGuards(SocketBearerTokenGuard)
  @UseFilters(SocketCatchHttpExceptionFilter)
  @SubscribeMessage('enter_chat')
  async enterChat(
    // 방의 chat ID들을 리스트로 받는다.
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    // for (const chatId of data) {
    //   socket.join(chatId.toString());
    // }
    for (const chatId of data.chatIds) {
      const exists = await this.chatsService.checkIfChatExists(chatId);

      if (!exists) {
        throw new WsException({
          message: `존재하지 않는 chat입니다. chatId: ${chatId}`,
        });
      }
    }
    socket.join(data.chatIds.map((chatId) => chatId.toString()));
  }

  @UsePipes(
    new ValidationPipe({
      transform: true, // paginate-post.dtd.ts 에서 기본값을 적용하게 하기 위해 씀
      transformOptions: {
        enableImplicitConversion: true, // transform이 될 때 class validator 기반으로 임의로 변환시켜줌
      },
      whitelist: true, // paginate-post dto에서 정하지 않은 프로퍼티들 다 못들어오게함 strip함
      forbidNonWhitelisted: true, // true가 되면 strip 대신에 에러를 던진다.
    }),
  )
  // @UseGuards(SocketBearerTokenGuard)
  @UseFilters(SocketCatchHttpExceptionFilter)
  // socket.on('send_message', (message) => {console.log(message)}
  @SubscribeMessage('send_message')
  async sendMessage(
    @MessageBody() dto: CreateMessagesDto,
    @ConnectedSocket() socket: Socket & { user: UsersModel },
  ) {
    const chatExists = await this.chatsService.checkIfChatExists(dto.chatId);

    if (!chatExists) {
      throw new WsException(
        `존재하지 않는 채팅방입니다. Chat ID : ${dto.chatId}`,
      );
    }

    const message = await this.messagesService.createMessages(
      dto,
      socket.user.id,
    );
    // this.server.emit('receive_message', 'hello from server');
    // broadcasting -> socket.to
    socket.to(message.chat.id.toString()).emit('receive_message', dto.message);
    // this.server.in(data.chatId.toString()).emit('receive_message', data.message);
  }
}
