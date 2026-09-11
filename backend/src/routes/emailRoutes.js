const express = require('express');
const { getEmailLogs, getSmtpStatus, sendBroadcastEmail } = require('../controllers/emailController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/logs', protect, authorize('admin', 'company'), getEmailLogs);
router.get('/status', protect, getSmtpStatus);
router.post('/send', protect, authorize('admin', 'company'), sendBroadcastEmail);

module.exports = router;
