import {Injectable} from '@angular/core';
import {Socket} from "ngx-socket-io";

export interface ChatMessage {
  username: string,
  message: string
}

@Injectable()
export class MessagerService {

  constructor(private socket: Socket) {
  }

  sendMessage(chatMessage: ChatMessage) {
    this.socket.emit('addDoc', chatMessage);
  }
}
