import { Server } from 'socket.io';

// Export dynamic configuration if needed
export const dynamic = 'force-dynamic'; // Force dynamic route to avoid caching for real-time functionality

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      cors: {
        origin: '*', // Adjust for production as needed
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

        // Remove message after 60 seconds
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
