const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  location: {
    city: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
  },
  images: [{ type: String }],
  type: { 
    type: String, 
    enum: ['room', 'apartment', 'house', 'villa', 'studio', 'shared','bike', 'car','other'], 
    required: true 
  },
  amenities: {
    wifi: { type: Boolean  },
    parking: { type: Boolean },
    ac: { type: Boolean },
    // Add more as needed
  },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  views: { type: Number, default: 0 },
  favoritesCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);