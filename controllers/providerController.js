const Property = require('../models/Property');

exports.getDashboard = async (req, res) => {
  try {
    const properties = await Property.find({ provider: req.user.id });
    
    const totalListings = properties.length;
    const totalViews = properties.reduce((sum, prop) => sum + prop.views, 0);
    const totalFavorites = properties.reduce((sum, prop) => sum + prop.favoritesCount, 0);
    
    const recentProperties = properties
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    res.status(200).json({
      totalListings,
      totalViews,
      totalFavorites,
      recentProperties
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};