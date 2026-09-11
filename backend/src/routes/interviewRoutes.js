const express = require('express');
const {
  getInterviews,
  createInterview,
  updateInterview,
  deleteInterview
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getInterviews);
router.post('/', protect, authorize('admin', 'company'), createInterview);
router.put('/:id', protect, authorize('admin', 'company'), updateInterview);
router.delete('/:id', protect, authorize('admin', 'company'), deleteInterview);

module.exports = router;
