const Property = require('../models/Property');

exports.createProperty = async (req, res) => {
  try {
    const { title, description, price, city, address, lat, lng, type } = req.body;
    const images = req.files.map(file => file.path);
    
    const property = new Property({
      title,
      description,
      price,
      location: { city, address, lat, lng },
      images,
      type,
      provider: req.user.id,
    });
    
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const { city, type, minPrice, maxPrice, keyword } = req.query;
    const query = {};
    
    if (city) query['location.city'] = city;
    if (type) query.type = type;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];
    }
    
    const properties = await Property.find(query).populate('provider', 'name email');
    res.status(200).json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.trackVisit = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.status(200).json({ views: property.views });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};