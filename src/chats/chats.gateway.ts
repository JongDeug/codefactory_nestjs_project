import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatsService } from './chats.service';
import { EnterChatDto } from './dto/enter-chat.dto';

@WebSocketGateway({
  namespace: 'chats', // ws://localhost:3000/chats, 카카오톡 서비스 전체라고 생각
})
export class ChatsGateway implements OnGatewayConnection {
  constructor(private readonly chatsService: ChatsService) {}

  @WebSocketServer()
  server: Server; // server(3000)

  handleConnection(socket: Socket): any {
    console.log(`on connect called : ${socket.id}`);
  }

  @SubscribeMessage('create_chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() socket: Socket,
  ) {
    const chat = await this.chatsService.createChat(data);
  }

  @SubscribeMessage('enter_chat')
  async enterChat(
    // 방의 chat ID들을 리스트로 받는다.
    @MessageBody() data: EnterChatDto,
    @ConnectedSocket() socket: Socket,
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

  // socket.on('send_message', (message) => {console.log(message)}
  @SubscribeMessage('send_message')
  sendMessage(
    @MessageBody() data: { message: string; chatId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    // this.server.emit('receive_message', 'hello from server');
    // broadcasting -> socket.to
    socket.to(data.chatId.toString()).emit('receive_message', data.message);
    // this.server.in(data.chatId.toString()).emit('receive_message', data.message);
  }
}
