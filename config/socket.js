import { Server } from 'socket.io';
import { inicializarChat } from '../sockets/chatSocket.js';

export const inicializarSocket = (server) => {

  const io = new Server(server, {

    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }

  });

  // Registrar eventos del asistente
  inicializarChat(io);

  console.log('Socket.IO inicializado correctamente');

  return io;
};