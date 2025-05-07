const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isUser } = require('../middleware/auth');

router.post('/properties/:propertyId/favorite', authenticate, isUser, userController.toggleFavorite);
router.get('/favorites', authenticate, isUser, userController.getFavorites);

module.exports = router;