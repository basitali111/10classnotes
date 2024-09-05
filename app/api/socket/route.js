import { Server } from 'socket.io';


export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/socket', // Ensure correct path for socket connection
      cors: {
        origin: '*',
      },
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
      });

      socket.on('chatMessage', ({ roomId, message }) => {
        io.to(roomId).emit('chatMessage', message);
        setTimeout(() => {
          io.to(roomId).emit('deleteMessage', message);
        }, 60000);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
    console.log('Socket.io server initialized');
  } else {
    console.log('Socket.io server already running');
  }
  res.end();
}
