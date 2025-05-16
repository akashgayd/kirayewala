const Message = require('../models/Message');
const Property = require('../models/Property');
const User = require('../models/User');
const mongoose = require('mongoose');
const socket = require('../socket/socket');

// Get chat history between users for a specific property
exports.getChatHistory = async (req, res) => {
  try {
    const { userId, propertyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ error: 'Invalid IDs' });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const messages = await Message.find({
      property: propertyId,
      $or: [
        { from: req.user.id, to: userId },
        { from: userId, to: req.user.id }
      ]
    })
    .sort('createdAt')
    .populate('from', 'name email')
    .populate('to', 'name email')
    .populate('property', 'title');

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error in getChatHistory:", err);
    res.status(500).json({ error: err.message });
  }
};

// Other controller methods remain the same...

// Get all conversations for the logged-in user
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { from: req.user._id },
            { to: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$from", req.user._id] },
              { userId: "$to", propertyId: "$property" },
              { userId: "$from", propertyId: "$property" }
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$to", req.user._id] },
                  { $eq: ["$read", false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "properties",
          localField: "_id.propertyId",
          foreignField: "_id",
          as: "property"
        }
      },
      { $unwind: { path: "$property", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: "$_id.propertyId",
          userId: "$_id.userId",
          user: 1,
          lastMessage: 1,
          unreadCount: 1,
          property: 1
        }
      }
    ]);

    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send a message for a specific property
exports.sendMessageForProperty = async (req, res) => {
  try {
    const { message } = req.body;
    const { propertyId } = req.params;

    if (!message || !propertyId) {
      return res.status(400).json({ error: 'Message and property ID are required' });
    }

    const property = await Property.findById(propertyId).populate('provider');
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (!property.provider) {
      return res.status(400).json({ error: 'Property has no provider' });
    }

    // Create new message
    const newMessage = await Message.create({
      from: req.user.id,
      to: property.provider._id,
      property: propertyId,
      message
    });

    // Populate sender details
    const populatedMessage = await Message.populate(newMessage, {
      path: 'from',
      select: 'name email'
    });

    // Schedule auto-deletion
    setTimeout(async () => {
      await Message.deleteOne({ _id: newMessage._id });
    }, AUTO_DELETE_MINUTES * 60 * 1000);

    // Emit socket event
    socket.getIO().emit('newMessage', {
      to: property.provider._id,
      message: populatedMessage
    });

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reply to a message
exports.replyToMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { messageId } = req.params;

    if (!message || !messageId) {
      return res.status(400).json({ error: 'Message content and ID are required' });
    }

    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ error: 'Original message not found' });
    }

    // Determine recipient
    const toUser = originalMessage.from.equals(req.user._id) 
      ? originalMessage.to 
      : originalMessage.from;

    const replyMessage = await Message.create({
      from: req.user._id,
      to: toUser,
      property: originalMessage.property,
      message
    });

    // Populate sender details
    const populatedMessage = await Message.populate(replyMessage, {
      path: 'from',
      select: 'name email'
    });

    // Schedule auto-deletion
    setTimeout(async () => {
      await Message.deleteOne({ _id: replyMessage._id });
    }, AUTO_DELETE_MINUTES * 60 * 1000);

    // Emit socket event
    socket.getIO().emit('newMessage', {
      to: toUser,
      message: populatedMessage
    });

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get messages for a provider's properties
exports.getMessagesForProvider = async (req, res) => {
  try {
    const properties = await Property.find({ provider: req.user._id });
    const propertyIds = properties.map(p => p._id);

    const messages = await Message.find({
      $or: [
        { to: req.user._id },
        { property: { $in: propertyIds } }
      ]
    })
    .populate('from', 'name email')
    .populate('property', 'title')
    .sort('-createdAt');

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Mark a message as read
exports.markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (!message.to.equals(req.user._id)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { 
        read: true,
        readAt: new Date() 
      },
      { new: true }
    );

    res.status(200).json(updatedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};