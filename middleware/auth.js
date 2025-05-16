const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const authenticate = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token with secret
    req.user = await User.findById(decoded.id); 
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token is not valid' });
  }
};

// Middleware to check if user is a provider
// const isProvider = (req, res, next) => {
//   if (req.user.role !== 'provider') {
//     return res.status(403).json({ error: 'Access denied. Provider role required' });
//   }
//   next();
// };

// Middleware to check if user is a regular user
const isUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ error: 'Access denied. User role required' });
  }
  next();
};

module.exports = { authenticate,  isUser };
