const { Server } = require('socket.io');
const http = require('http');
const nodemailer = require('nodemailer'); // Import Nodemailer
const User = require('./models/User'); // Assuming you have a user model to fetch users from your database

// Create an HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running\n');
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let onlineUsers = [];

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Your Gmail address
    pass: 'your-email-password',  // Your Gmail password (or use App password for security)
  },
});

// Function to send email notification
const sendEmailNotification = async (recipientEmail, onlineUser) => {
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: recipientEmail,
    subject: 'User Came Online Notification',
    text: `User ${onlineUser} just came online!`, // Simple message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipientEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${recipientEmail}:`, error);
  }
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  // Handle when a user comes online
  socket.on('userOnline', async ({ email }) => {
    const userExists = onlineUsers.find((user) => user.email === email);
    if (!userExists) {
      onlineUsers.push({ email, socketId: socket.id });
    }

    // Notify all clients of the updated online users
    io.emit('updateOnlineUsers', onlineUsers);

    // Broadcast a notification to all other clients that a user has come online
    socket.broadcast.emit('userCameOnline', { email });

    // Send email notifications to other users except the one who just came online
    const otherUsers = await User.find({ email: { $ne: email } }); // Get all other users from the database

    otherUsers.forEach((otherUser) => {
      sendEmailNotification(otherUser.email, email); // Send an email to each user
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    io.emit('updateOnlineUsers', onlineUsers); // Notify all clients
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
