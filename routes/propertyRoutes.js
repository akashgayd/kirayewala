const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const chatController= require('../controllers/chatController'); // Import message controller
const { authenticate, isUser } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Create a new property (only for authenticated providers)
router.post(
  '/',
  authenticate,
  isUser,
  upload.array('images', 5), // images field name should match frontend
  propertyController.createProperty
);

// Get properties (public route, no need for authenticate here)
router.get('/', propertyController.getProperties);

// Track property views (public or optional auth)
router.post('/:id/visit', propertyController.trackVisit);

// Send a message for a specific property
router.post('/:id/message', authenticate, isUser, chatController.sendMessageForProperty);

module.exports = router;