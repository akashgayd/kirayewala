const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticate, isProvider } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post(
  '/',
  authenticate,
  isProvider,
  upload.array('images', 5),
  propertyController.createProperty
);

router.get('/', propertyController.getProperties,authenticate);

router.post('/:id/visit', propertyController.trackVisit);

module.exports = router;