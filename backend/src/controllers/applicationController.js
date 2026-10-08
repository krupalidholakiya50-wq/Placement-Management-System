const Application = require('../models/Application');
const Job = require('../models/Job');
const Student = require('../models/Student');
const Offer = require('../models/Offer');
const ExcelJS = require('exceljs');
const { logActivity } = require('./activityController');

// @desc    STAGE 3: Apply for job drive with backend eligibility re-validation & DUPLICATE GUARD
// @route   POST /api/applications
// @access  Private (Student)
exports.applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Placement job drive not found' });
    }

    let student = await Student.findOne({ user: req.user.id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }

    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'No student profile found. Please complete your profile first.'
      });
    }

    // DUPLICATE SUBMISSION GUARD
    const existingApp = await Application.findOne({ job: jobId, student: student._id });
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: '🔒 Duplicate Submission Guard: You have already applied for this placement drive!'
      });
    }

    // BACKEND ELIGIBILITY RE-VALIDATION
    if (student.verificationStatus !== 'Verified') {
      return res.status(403).json({
        success: false,
        message: 'Stage 1 Verification Pending. Profile must be verified by TPO Cell before applying to campus drives.'
      });
    }

    if (student.placementStatus === 'Blacklisted') {
      return res.status(403).json({
        success: false,
        message: `Account Blacklisted. Debarred for ${student.blacklistedUntilDrives || 3} drives due to prior No-Show.`
      });
    }

    if (student.cgpa < job.minCgpa) {
      return res.status(403).json({
        success: false,
        message: `Not Eligible: Minimum required CGPA is ${job.minCgpa}. Your current CGPA is ${student.cgpa}.`
      });
    }

    if (student.backlogs > job.maxBacklogs) {
      return res.status(403).json({
        success: false,
        message: `Not Eligible: Maximum allowed backlogs is ${job.maxBacklogs}. You currently have ${student.backlogs} backlogs.`
      });
    }

    // Auto-Debar Policy & Dream Offer Rule
    if (student.placementStatus === 'Placed') {
      const currentPackage = student.placedPackage || 10.0;
      const newPackage = job.salaryPackage || 12.0;

      if (newPackage <= 2 * currentPackage) {
        return res.status(403).json({
          success: false,
          message: `One-Student-One-Job Lock: You are already placed at ${currentPackage} LPA. You can only apply to Dream Offers (> ${(2 * currentPackage).toFixed(1)} LPA).`
        });
      }
    }

    const application = await Application.create({
      job: jobId,
      student: student._id,
      studentUser: req.user.id,
      studentName: student.fullName,
      studentEmail: student.email,
      department: student.department,
      branch: student.branch,
      cgpa: student.cgpa,
      backlogs: student.backlogs || 0,
      resumeUrl: student.resumeUrl,
      status: 'Applied',
      statusTimeline: [
        {
          status: 'Applied',
          note: 'Application registered via Campus Job Portal.'
        }
      ]
    });

    logActivity({
      type: 'APPLICATION_SUBMITTED',
      title: `${student.fullName} applied to ${job.companyName}`,
      description: `Role: ${job.title} | Branch: ${student.branch} | CGPA: ${student.cgpa}`,
      actor: student.fullName,
      actorRole: 'student',
      targetBranch: student.branch,
      relatedId: application._id
    });

    res.status(201).json({
      success: true,
      message: `Application submitted successfully for ${job.title} at ${job.companyName}!`,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in student's applications
// @route   GET /api/applications/my
// @access  Private (Student)
exports.getMyApplications = async (req, res, next) => {
  try {
    let student = await Student.findOne({ user: req.user.id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }

    if (!student) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const applications = await Application.find({ student: student._id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications (Admin / Company Recruiter)
// @route   GET /api/applications
// @access  Private
exports.getApplications = async (req, res, next) => {
  try {
    let query = {};

    if (req.query.jobId) {
      query.job = req.query.jobId;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      query.$or = [{ studentName: regex }, { studentEmail: regex }, { branch: regex }];
    }

    const applications = await Application.find(query)
      .populate('job')
      .populate('student')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    STAGE 4 & 5: Advance candidate status in 7-stage interview pipeline & generate Offer LOI on HR Clear / Selected
// @route   PUT /api/applications/:id/status
// @access  Private (Admin / Company)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body; 
    // status options: 'Applied' | 'Resume Shortlisted' | 'Aptitude Test Cleared' | 'Group Discussion Cleared' | 'Technical Interview Cleared' | 'HR Interview Cleared' | 'Selected' | 'Rejected'

    const application = await Application.findById(req.params.id).populate('student').populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found' });
    }

    application.status = status;
    application.statusTimeline.push({
      status,
      note: note || `Candidate advanced to '${status}' round by Recruiter / TPO.`
    });

    await application.save();

    logActivity({
      type: 'STATUS_UPDATED',
      title: `${application.studentName} -> ${status}`,
      description: `Drive: ${application.job ? application.job.companyName : 'Placement Drive'} (${application.job ? application.job.title : 'Position'})`,
      actor: req.user ? req.user.name : 'Placement Cell',
      actorRole: req.user ? req.user.role : 'company',
      targetBranch: application.branch || 'All Branches',
      relatedId: application._id
    });

    // STAGE 5: AUTO GENERATE OFFER LETTER / LOI WHEN HR INTERVIEW CLEARED OR SELECTED
    if ((status === 'Selected' || status === 'HR Interview Cleared') && application.student && application.job) {
      const existingOffer = await Offer.findOne({ application: application._id });
      if (!existingOffer) {
        await Offer.create({
          application: application._id,
          job: application.job._id,
          student: application.student._id,
          studentName: application.studentName,
          companyName: application.job.companyName,
          role: application.job.title,
          packageOffered: application.job.salaryPackage || 12.0,
          location: application.job.location || 'Bangalore',
          loiText: `OFFICIAL LETTER OF INTENT (LOI)\nDear ${application.studentName},\nWe are pleased to offer you the position of ${application.job.title} at ${application.job.companyName} with an annual CTC package of ${application.job.salaryPackage} LPA. Please accept this LOI on your student dashboard to confirm your joining.`,
          status: 'Pending'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Candidate pipeline status updated to '${status}'`,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export Drive Applicant Shortlist to Excel (.xlsx)
// @route   GET /api/applications/export-excel
// @access  Private (Admin / Company)
exports.exportApplicantsToExcel = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.jobId) query.job = req.query.jobId;
    if (req.query.status) query.status = req.query.status;

    const applications = await Application.find(query)
      .populate('job')
      .populate('student')
      .sort({ createdAt: -1 });

    const jobInfo = applications.length > 0 && applications[0].job ? applications[0].job.companyName : 'Placement_Drive';

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Placement Management System TPO Office';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Drive Candidates Shortlist');

    // Headers
    worksheet.columns = [
      { header: 'Student Name', key: 'studentName', width: 25 },
      { header: 'Email Address', key: 'studentEmail', width: 30 },
      { header: 'Department', key: 'department', width: 22 },
      { header: 'Branch', key: 'branch', width: 18 },
      { header: 'CGPA', key: 'cgpa', width: 10 },
      { header: 'Backlogs', key: 'backlogs', width: 10 },
      { header: 'Resume URL', key: 'resumeUrl', width: 45 },
      { header: 'Job Title', key: 'jobTitle', width: 25 },
      { header: 'Company', key: 'companyName', width: 22 },
      { header: 'Pipeline Status', key: 'status', width: 22 },
      { header: 'Application Date', key: 'appliedAt', width: 18 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0F172A' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    headerRow.height = 24;

    applications.forEach((app) => {
      worksheet.addRow({
        studentName: app.studentName,
        studentEmail: app.studentEmail,
        department: app.department || 'N/A',
        branch: app.branch || 'N/A',
        cgpa: app.cgpa || (app.student ? app.student.cgpa : 8.5),
        backlogs: app.backlogs || 0,
        resumeUrl: app.resumeUrl,
        jobTitle: app.job ? app.job.title : 'Drive Position',
        companyName: app.job ? app.job.companyName : 'Partner Corp',
        status: app.status,
        appliedAt: new Date(app.appliedAt || app.createdAt).toLocaleDateString()
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Candidate_Shortlist_${jobInfo.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    next(error);
  }
};
