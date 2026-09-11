const Activity = require('../models/Activity');

/**
 * Utility helper to record an activity event asynchronously
 */
const logActivity = async ({ type, title, description, actor, actorRole, targetBranch, relatedId }) => {
  try {
    await Activity.create({
      type,
      title,
      description,
      actor: actor || 'Placement Cell',
      actorRole: actorRole || 'system',
      targetBranch: targetBranch || 'All Branches',
      relatedId
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

// @desc    Get recent live placement activities
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    let filter = {};

    // If student, filter by their branch or general
    if (req.user && req.user.role === 'student' && req.user.department) {
      filter.$or = [
        { targetBranch: 'All Branches' },
        { targetBranch: { $regex: req.user.department, $options: 'i' } }
      ];
    }

    const activities = await Activity.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  logActivity,
  getActivities
};
