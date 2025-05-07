const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 40000, // 40 seconds timeout
      socketTimeoutMS: 45000, // Close sockets after 45s inactivity
    });
    console.log('MongoDB Atlas Connected');
  } catch (err) {
    console.error('MongoDB Atlas Connection Error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;