const express = require('express');
const { getMyOffers, respondToOffer, getOffers } = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my', protect, authorize('student'), getMyOffers);
router.put('/:id/respond', protect, authorize('student'), respondToOffer);
router.get('/', protect, authorize('admin', 'company'), getOffers);

module.exports = router;
