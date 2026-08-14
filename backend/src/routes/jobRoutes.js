const express = require('express');
const {
  getJobs,
  getJobById,
  checkEligibility,
  createJob,
  approveJobDrive,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:id/check-eligibility', protect, authorize('student'), checkEligibility);
router.put('/:id/approve', protect, authorize('admin'), approveJobDrive);

router
  .route('/')
  .get(getJobs)
  .post(protect, authorize('admin', 'company'), createJob);

router
  .route('/:id')
  .get(getJobById)
  .put(protect, authorize('admin', 'company'), updateJob)
  .delete(protect, authorize('admin', 'company'), deleteJob);

module.exports = router;
