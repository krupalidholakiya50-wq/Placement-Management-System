const Invitation = require('../models/Invitation');

// @desc    STEP 2: TPO sends Email Invitation to Recruiter Company
// @route   POST /api/invitations
// @access  Private (Admin)
exports.sendRecruiterInvitation = async (req, res, next) => {
  try {
    const { recruiterName, recruiterEmail, companyName } = req.body;

    if (!recruiterEmail || !companyName) {
      return res.status(400).json({ success: false, message: 'Recruiter email & company name are required' });
    }

    const invitation = await Invitation.create({
      recruiterName: recruiterName || 'Hiring Manager',
      recruiterEmail,
      companyName,
      invitedBy: req.user.id,
      status: 'Sent',
      emailLog: {
        subject: `Campus Placement Drive Invitation 2026 - ${companyName}`,
        sentAt: new Date(),
        status: 'Delivered (Simulated Nodemailer Email Service)'
      }
    });

    res.status(201).json({
      success: true,
      message: `📧 Email invitation dispatched to ${recruiterEmail} for ${companyName}!`,
      data: invitation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all invitations sent by TPO
// @route   GET /api/invitations
// @access  Private (Admin / Company)
exports.getInvitations = async (req, res, next) => {
  try {
    const invitations = await Invitation.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: invitations.length,
      data: invitations
    });
  } catch (error) {
    next(error);
  }
};
