const express = require('express');
const {
  getStudents,
  getStudentById,
  getStudentProfile,
  updateStudentProfileMe,
  submitForVerification,
  verifyStudentProfile,
  unlockStudentProfile,
  createStudent,
  updateStudent,
  deleteStudent,
  exportStudentsToExcel,
  bulkVerifyStudents,
  addResumeVersion,
  uploadResumeFile
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload-resume', upload.single('resume'), uploadResumeFile);
router.get('/export-excel', protect, exportStudentsToExcel);
router.post('/bulk-verify', protect, authorize('admin'), bulkVerifyStudents);
router.post('/resume-version', protect, authorize('student'), addResumeVersion);
router.route('/profile/me')
  .get(protect, getStudentProfile)
  .put(protect, updateStudentProfileMe);

router.post('/submit-verification', protect, authorize('student'), submitForVerification);
router.put('/:id/verify', protect, authorize('admin'), verifyStudentProfile);
router.put('/:id/unlock', protect, authorize('admin'), unlockStudentProfile);

router
  .route('/')
  .get(protect, getStudents)
  .post(protect, authorize('admin'), createStudent);

router
  .route('/:id')
  .get(protect, getStudentById)
  .put(protect, updateStudent)
  .delete(protect, authorize('admin'), deleteStudent);

module.exports = router;
