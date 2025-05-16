const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.get('/conversations', authenticate, chatController.getConversations);
router.get('/:userId/:propertyId', authenticate, chatController.getChatHistory);
router.post('/:propertyId/message', authenticate, chatController.sendMessageForProperty);
router.post('/reply/:messageId', authenticate, chatController.replyToMessage);
router.get('/provider/messages', authenticate, chatController.getMessagesForProvider);
router.patch('/messages/:messageId/read', authenticate, chatController.markMessageAsRead);

module.exports = router;