const express = require('express');
const {
  getCompanies,
  getCompanyById,
  createCompany,
  approveCompany,
  updateCompany,
  deleteCompany
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/:id/approve', protect, authorize('admin'), approveCompany);

router
  .route('/')
  .get(getCompanies)
  .post(protect, authorize('admin', 'company'), createCompany);

router
  .route('/:id')
  .get(getCompanyById)
  .put(protect, authorize('admin', 'company'), updateCompany)
  .delete(protect, authorize('admin'), deleteCompany);

module.exports = router;
