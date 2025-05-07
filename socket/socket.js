const socketio = require('socket.io');
const Message = require('../models/Message');

const configureSocket = (server) => {
  const io = socketio(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Join user's room
    socket.on('join', (userId) => {
      socket.join(userId);
      socket.userId = userId;
    });
    
    // Handle messages
    socket.on('send-message', async ({ to, message }) => {
      const newMessage = new Message({
        from: socket.userId,
        to,
        message,
      });
      
      await newMessage.save();
      
      io.to(to).emit('receive-message', {
        from: socket.userId,
        message,
      });
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });

  return io;
};

module.exports = configureSocket;