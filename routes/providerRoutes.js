const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { authenticate, isProvider } = require('../middleware/auth');

router.get('/dashboard', authenticate, isProvider, providerController.getDashboard);

module.exports = router;