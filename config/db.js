const mongoose = require('mongoose');

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Failed:', err);
    process.exit(1);
  }
};

module.exports = connectDB;