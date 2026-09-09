const express = require('express');
const { sendRecruiterInvitation, getInvitations } = require('../controllers/invitationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('admin'), sendRecruiterInvitation);
router.get('/', protect, authorize('admin', 'company'), getInvitations);

module.exports = router;
