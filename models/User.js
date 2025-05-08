const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  otp: { type: String },
  otpExpires: { type: Date },
  role: { type: String, enum: ['user', 'provider'], default: 'provider' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);