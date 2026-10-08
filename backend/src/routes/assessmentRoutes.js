const express = require('express');
const {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  publishAssessment,
  getStudentAssessments,
  startAssessment,
  submitAssessment,
  getAssessmentAttempts,
  shortlistFromAssessment
} = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Student routes
router.get('/student/my', protect, getStudentAssessments);
router.post('/:id/start', protect, startAssessment);
router.post('/:id/submit', protect, submitAssessment);

// Admin / Recruiter routes
router.get('/', protect, authorize('admin', 'company'), getAssessments);
router.post('/', protect, authorize('admin', 'company'), createAssessment);
router.get('/:id', protect, getAssessmentById);
router.put('/:id', protect, authorize('admin', 'company'), updateAssessment);
router.delete('/:id', protect, authorize('admin', 'company'), deleteAssessment);
router.put('/:id/publish', protect, authorize('admin', 'company'), publishAssessment);
router.get('/:id/attempts', protect, authorize('admin', 'company'), getAssessmentAttempts);
router.post('/:id/shortlist', protect, authorize('admin', 'company'), shortlistFromAssessment);

module.exports = router;
