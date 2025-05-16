const Property = require('../models/Property');
const User = require('../models/User');

// Make sure all these methods are properly exported
module.exports = {
  getPropertiesForUser: async (req, res) => {
    try {
      const properties = await Property.find({}).populate('provider', 'name email');
      res.status(200).json(properties);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getPropertyCategories: async (req, res) => {
    try {
      const categories = await Property.distinct('type');
      res.status(200).json(categories);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getPropertyDetails: async (req, res) => {
    try {
      const property = await Property.findById(req.params.id)
        .populate('provider', 'name email');
      res.status(200).json(property);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

toggleFavorite: async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const propertyId = req.params.id;

    const index = user.favorites.indexOf(propertyId);
    let action;

    if (index === -1) {
      user.favorites.push(propertyId);
      action = 'added';
    } else {
      user.favorites.splice(index, 1);
      action = 'removed';
    }

    await user.save();

    const property = await Property.findById(propertyId);
    const favoritesCount = await User.countDocuments({ favorites: propertyId });

    res.status(200).json({ success: true, action, favoritesCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
},


  getFavorites: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).populate('favorites');
      res.status(200).json(user.favorites);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password -otp');
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        req.body,
        { new: true }
      ).select('-password -otp');
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};