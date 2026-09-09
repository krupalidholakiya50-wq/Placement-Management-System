const express = require('express');
const { getNotices, createNotice, deleteNotice, testSendEmail } = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getNotices);
router.post('/', protect, authorize('admin'), createNotice);
router.post('/test-email', testSendEmail);
router.delete('/:id', protect, authorize('admin'), deleteNotice);

module.exports = router;


