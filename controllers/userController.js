const Property = require('../models/Property');
const User = require('../models/User');

exports.toggleFavorite = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user.id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const user = await User.findById(userId);
    const index = user.favorites.indexOf(propertyId);

    if (index === -1) {
      user.favorites.push(propertyId);
      property.favoritesCount += 1;
    } else {
      user.favorites.splice(index, 1);
      property.favoritesCount -= 1;
    }

    await user.save();
    await property.save();

    res.status(200).json({ 
      isFavorite: index === -1,
      favoritesCount: property.favoritesCount 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.status(200).json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};