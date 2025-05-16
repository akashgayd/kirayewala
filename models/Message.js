const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property'
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
}, { timestamps: true });

// Create index on expiresAt for efficient cleanup
messageSchema.index({ expiresAt: 1 });

// Create compound index for efficient conversation queries
messageSchema.index({ from: 1, to: 1 });
messageSchema.index({ property: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;