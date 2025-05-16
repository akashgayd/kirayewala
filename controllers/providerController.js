const Property = require('../models/Property');
const Message = require('../models/Message');

exports.getDashboard = async (req, res) => {
  try {
    const properties = await Property.find({ provider: req.user.id });

    const totalListings = properties.length;
    const totalViews = properties.reduce((sum, prop) => sum + prop.views, 0);
    const totalFavorites = properties.reduce((sum, prop) => sum + prop.favoritesCount, 0);

    const recentProperties = properties
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    // Fetch messages related to the provider's properties
    const propertyIds = properties.map(prop => prop._id);
    const messages = await Message.find({ to: req.user.id, property: { $in: propertyIds } })
      .populate('from', 'name email')
      .populate('property', 'title');

    // Group messages by property and user
    const interestedUsers = messages.reduce((acc, message) => {
      const propertyId = message.property._id.toString();
      if (!acc[propertyId]) {
        acc[propertyId] = { property: message.property, users: [] };
      }
      if (!acc[propertyId].users.some(user => user._id.toString() === message.from._id.toString())) {
        acc[propertyId].users.push(message.from);
      }
      return acc;
    }, {});

    res.status(200).json({
      totalListings,
      totalViews,
      totalFavorites,
      recentProperties,
      interestedUsers: Object.values(interestedUsers), // Convert to array for easier handling
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};