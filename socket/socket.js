// socketServer.js
const socketIO = require('socket.io');
const Message = require('../models/Message');
const mongoose = require('mongoose');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket connection handling
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining with their userId
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
      }
    });

    // Handle sending messages
    socket.on('send-message', async (data) => {
      try {
        const { to, message } = data;
        
        if (to) {
          // Emit to recipient's room
          io.to(to).emit('receive-message', message);
          console.log(`Message sent to user ${to}`);
        }
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  // Set up message expiration check
  setInterval(async () => {
    try {
      const now = new Date();
      await Message.deleteMany({ expiresAt: { $lt: now } });
    } catch (error) {
      console.error('Error cleaning expired messages:', error);
    }
  }, 60000); // Check every minute

  return io;
};

// Get socket instance
const getIO = () => io;

module.exports = { initializeSocket, getIO };