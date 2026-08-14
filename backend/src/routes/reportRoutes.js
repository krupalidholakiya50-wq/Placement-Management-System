const express = require('express');
const { getAnalytics } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/analytics', protect, getAnalytics);
router.get('/summary', protect, getAnalytics);

module.exports = router;
