const express = require('express');
const {
  applyForJob,
  getMyApplications,
  getApplications,
  updateApplicationStatus,
  exportApplicantsToExcel
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/export-excel', protect, authorize('admin', 'company'), exportApplicantsToExcel);
router.post('/', protect, authorize('student'), applyForJob);
router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/', protect, authorize('admin', 'company'), getApplications);
router.put('/:id/status', protect, authorize('admin', 'company'), updateApplicationStatus);

module.exports = router;
