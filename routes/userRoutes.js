const express = require('express');
const router = express.Router();
const {
  getPropertiesForUser,
  getPropertyCategories,
  getPropertyDetails,
  toggleFavorite,
  getFavorites,
  getProfile,
  updateProfile
} = require('../controllers/userController');
const { authenticate, isUser } = require('../middleware/auth');

// Public routes (no auth needed)
router.get('/properties', getPropertiesForUser);
router.get('/properties/categories', getPropertyCategories);
router.get('/properties/:id', getPropertyDetails);

// Protected routes (require auth)
router.post('/properties/:id/favorite', authenticate, isUser, toggleFavorite);
router.get('/favorites', authenticate, isUser, getFavorites);
router.get('/profile', authenticate, isUser, getProfile);
router.put('/profile', authenticate, isUser, updateProfile);

module.exports = router;