const Interview = require('../models/Interview');
const Application = require('../models/Application');
const Student = require('../models/Student');
const Job = require('../models/Job');
const { logActivity } = require('./activityController');

// @desc    Get all interview schedules (Role isolated)
// @route   GET /api/interviews
// @access  Private
exports.getInterviews = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'student') {
      let student = await Student.findOne({ user: req.user.id });
      if (!student) student = await Student.findOne({ email: req.user.email });
      if (!student) {
        return res.status(200).json({ success: true, count: 0, data: [] });
      }
      filter.student = student._id;
    } else if (req.user.role === 'company') {
      // Recruiter only sees interviews for their drives
      const recruiterJobs = await Job.find({ postedBy: req.user.id }).select('_id');
      const jobIds = recruiterJobs.map((j) => j._id);
      filter.job = { $in: jobIds };
    }

    const interviews = await Interview.find(filter)
      .populate('job')
      .populate('student')
      .sort({ interviewDate: 1, interviewTime: 1 });

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule new interview panel round
// @route   POST /api/interviews
// @access  Private (Admin / Company)
exports.createInterview = async (req, res, next) => {
  try {
    const { applicationId, job: jobId, student: studentId, roundName, roundNumber, interviewDate, interviewTime, mode, venue, meetingLink, panelName, remarks } = req.body;

    let application = null;
    let jobDoc = null;
    let studentDoc = null;

    if (applicationId) {
      application = await Application.findById(applicationId).populate('job').populate('student');
      if (application) {
        jobDoc = application.job;
        studentDoc = application.student;
      }
    }

    if (!jobDoc && jobId) {
      jobDoc = await Job.findById(jobId);
    }
    if (!studentDoc && studentId) {
      studentDoc = await Student.findById(studentId);
    }

    if (!application && jobDoc && studentDoc) {
      application = await Application.findOne({ job: jobDoc._id, student: studentDoc._id });
    }

    if (!studentDoc && !application) {
      return res.status(400).json({ success: false, message: 'Valid student and job details are required to schedule interview.' });
    }

    const studentName = studentDoc ? studentDoc.fullName : (application ? application.studentName : 'Candidate');
    const companyName = jobDoc ? jobDoc.companyName : (application && application.job ? application.job.companyName : 'Recruiting Company');

    const interview = await Interview.create({
      application: application ? application._id : null,
      job: jobDoc ? jobDoc._id : (application ? application.job : null),
      student: studentDoc ? studentDoc._id : (application ? application.student : null),
      studentName,
      companyName,
      roundName: roundName || `Tech Round ${roundNumber || 1}`,
      interviewDate: interviewDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      interviewTime: interviewTime || '10:30 AM',
      mode: mode || 'Online',
      venue: venue || 'Online Link / Seminar Hall',
      meetingLink: meetingLink || 'https://meet.google.com/abc-defg-hij',
      panelName: panelName || 'Technical Interview Panel A',
      remarks: remarks || 'Please carry updated resume and student ID card.',
      status: 'Scheduled'
    });

    if (application) {
      application.status = 'Technical Interview Cleared';
      application.statusTimeline.push({
        status: 'Technical Interview Cleared',
        note: `Interview scheduled: ${interview.roundName} on ${new Date(interview.interviewDate).toLocaleDateString()} at ${interview.interviewTime}`
      });
      await application.save();
    }

    await logActivity({
      type: 'INTERVIEW_SCHEDULED',
      title: `Interview Scheduled for ${studentName}`,
      description: `${companyName} scheduled ${interview.roundName} on ${new Date(interview.interviewDate).toLocaleDateString()} (${interview.interviewTime})`,
      actor: req.user ? req.user.name : 'Placement Cell',
      actorRole: req.user ? req.user.role : 'admin',
      targetBranch: studentDoc ? studentDoc.branch : (application ? application.branch : 'All Branches'),
      relatedId: interview._id
    });

    res.status(201).json({
      success: true,
      message: `Interview slot successfully scheduled for ${studentName}!`,
      data: interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update interview status or schedule
// @route   PUT /api/interviews/:id
// @access  Private (Admin / Company)
exports.updateInterview = async (req, res, next) => {
  try {
    let interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview slot not found' });
    }

    interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Interview slot updated successfully',
      data: interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete interview slot
// @route   DELETE /api/interviews/:id
// @access  Private (Admin / Company)
exports.deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview slot not found' });
    }

    await interview.deleteOne();
    res.status(200).json({ success: true, message: 'Interview slot cancelled and removed.' });
  } catch (error) {
    next(error);
  }
};
