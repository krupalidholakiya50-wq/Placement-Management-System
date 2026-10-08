const Offer = require('../models/Offer');
const Student = require('../models/Student');
const Application = require('../models/Application');
const User = require('../models/User');
const EmailLog = require('../models/EmailLog');
const { logActivity } = require('./activityController');
const { createNotification } = require('./notificationController');

// @desc    STEP 5: Get logged in student's Offer Letters & LOIs
// @route   GET /api/offers/my
// @access  Private (Student)
exports.getMyOffers = async (req, res, next) => {
  try {
    let student = await Student.findOne({ user: req.user.id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }

    if (!student) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const offers = await Offer.find({ student: student._id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    STEP 5: Student Accept or Decline Offer Letter (One-Student-One-Job Guard)
// @route   PUT /api/offers/:id/respond
// @access  Private (Student)
exports.respondToOffer = async (req, res, next) => {
  try {
    const { action } = req.body; // 'Accept' | 'Decline'

    if (!['Accept', 'Decline'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be Accept or Decline' });
    }

    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer record not found' });
    }

    let student = await Student.findById(offer.student);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (action === 'Accept') {
      offer.status = 'Accepted';
      offer.respondedAt = new Date();
      await offer.save();

      // ONE-STUDENT-ONE-JOB POLICY: Lock student & mark as Placed
      student.placementStatus = 'Placed';
      student.placedCompany = offer.companyName;
      student.placedPackage = offer.packageOffered;
      await student.save();

      logActivity({
        type: 'OFFER_EXTENDED',
        title: `🎉 Offer Accepted: ${student.fullName} -> ${offer.companyName}`,
        description: `Role: ${offer.role} | Package: ${offer.packageOffered} LPA`,
        actor: student.fullName,
        actorRole: 'student',
        targetBranch: student.branch || 'All Branches',
        relatedId: offer._id
      });

      // Notify Admin
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        await createNotification({
          recipient: admin._id,
          recipientRole: 'admin',
          title: `Offer Accepted: ${student.fullName}`,
          message: `${student.fullName} has accepted the placement offer from ${offer.companyName} (${offer.packageOffered} LPA).`,
          type: 'OFFER_EXTENDED',
          relatedEntity: 'Offer',
          relatedEntityId: offer._id,
          link: '/reports'
        });
      }

      return res.status(200).json({
        success: true,
        message: `🎉 Congratulations! You have accepted the Offer Letter from ${offer.companyName} (${offer.packageOffered} LPA). Your placement status is now PLACED!`,
        data: offer
      });
    } else {
      offer.status = 'Declined';
      offer.respondedAt = new Date();
      await offer.save();

      return res.status(200).json({
        success: true,
        message: `Offer from ${offer.companyName} was declined.`,
        data: offer
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all offers (Admin / Recruiter)
// @route   GET /api/offers
// @access  Private (Admin / Company)
exports.getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find()
      .populate('student')
      .populate('job')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (error) {
    next(error);
  }
};
