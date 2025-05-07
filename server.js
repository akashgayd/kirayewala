require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const userRoutes = require('./routes/userRoutes');
const providerRoutes = require('./routes/providerRoutes');
const chatRoutes = require('./routes/chatRoutes');
const errorHandler = require('./middleware/errorHandler');
const configureSocket = require('./socket/socket');


const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Rate limiting for OTP routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});
app.use('/api/auth/send-otp', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/user', userRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/chats', chatRoutes);

// Error handling
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.IO setup
const io = configureSocket(server);
app.set('io', io);