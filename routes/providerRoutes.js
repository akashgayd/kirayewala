const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const chatController = require('../controllers/chatController'); // Import message controller
const { authenticate, isUser } = require('../middleware/auth');

router.get('/dashboard', authenticate, isUser, providerController.getDashboard);

// Get messages for a provider's properties
router.get('/messages', authenticate, isUser, chatController.getMessagesForProvider);

// Reply to a message
router.post('/messages/:messageId/reply', authenticate, isUser, chatController.replyToMessage);

module.exports = router;