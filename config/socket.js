import { Server } from 'socket.io';

export const inicializarSocket = (server) => {
  const io = new Server(server);

  io.on('connection', (socket) => {
    console.log('Cliente conectado al WebSocket:', socket.id);

    socket.on('chat:mensaje', (data) => {
      io.emit('chat:mensaje', data);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  return io;
};