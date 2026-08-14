const Job = require('../models/Job');
const Student = require('../models/Student');

// Utility function to automatically calculate batch eligibility for a job drive
const calculateBatchEligibility = async (job) => {
  try {
    const verifiedStudents = await Student.find({ verificationStatus: 'Verified' });
    const totalCount = verifiedStudents.length || 1;

    let eligibleCount = 0;
    const eligibleStudentIds = [];

    verifiedStudents.forEach((student) => {
      let isEligible = true;

      // Rule 1: Min CGPA
      if (student.cgpa < job.minCgpa) isEligible = false;

      // Rule 2: 10th & 12th Percentage
      if (job.min10thPercent && student.tenthPercentage && student.tenthPercentage < job.min10thPercent) isEligible = false;
      if (job.min12thPercent && student.twelfthPercentage && student.twelfthPercentage < job.min12thPercent) isEligible = false;

      // Rule 3: Max Backlogs
      if (student.backlogs > job.maxBacklogs) isEligible = false;

      // Rule 4: Branch Eligibility
      if (job.eligibleBranches && job.eligibleBranches.length > 0) {
        const isBranchAllowed = job.eligibleBranches.some(
          (b) => b.toLowerCase().includes(student.branch.toLowerCase()) || student.branch.toLowerCase().includes(b.toLowerCase())
        );
        if (!isBranchAllowed) isEligible = false;
      }

      if (isEligible) {
        eligibleCount++;
        eligibleStudentIds.push(student._id);
      }
    });

    const ineligibleCount = Math.max(0, totalCount - eligibleCount);
    const eligibilityPercentage = Math.round((eligibleCount / totalCount) * 100);

    return {
      eligibleCount,
      ineligibleCount,
      eligibilityPercentage,
      eligibleStudentIds
    };
  } catch (err) {
    return { eligibleCount: 0, ineligibleCount: 0, eligibilityPercentage: 0, eligibleStudentIds: [] };
  }
};

// @desc    Get all jobs (Admin sees all; Students/Recruiters see approved/active)
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    let query = {};

    if (!req.user || req.user.role !== 'admin') {
      query.approvalStatus = 'Approved';
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      query.$or = [{ title: regex }, { companyName: regex }, { location: regex }];
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }
    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    STAGE 3: Smart Eligibility Engine API for individual student
// @route   POST /api/jobs/:id/check-eligibility
// @access  Private (Student)
exports.checkEligibility = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job drive not found' });
    }

    let student = await Student.findOne({ user: req.user.id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }

    if (!student) {
      return res.status(400).json({
        success: false,
        isEligible: false,
        reasons: ['No Student profile found in TPO records. Please create a profile first.']
      });
    }

    const reasons = [];

    // Rule 1: Verification Check
    if (student.verificationStatus !== 'Verified') {
      reasons.push(`Profile Verification Pending. Current status is '${student.verificationStatus}'. Admin TPO verification required.`);
    }

    // Rule 2: Blacklist Check
    if (student.placementStatus === 'Blacklisted') {
      reasons.push(`Account Blacklisted due to prior interview No-Show. Debarred for ${student.blacklistedUntilDrives || 3} drives.`);
    }

    // Rule 3: CGPA Criteria
    if (student.cgpa < job.minCgpa) {
      reasons.push(`Minimum CGPA required is ${job.minCgpa}. Your current CGPA is ${student.cgpa}.`);
    }

    // Rule 3.5: 10th and 12th Marks Criteria
    if (job.min10thPercent && student.tenthPercentage && student.tenthPercentage < job.min10thPercent) {
      reasons.push(`Minimum 10th percentage required is ${job.min10thPercent}%. Your score is ${student.tenthPercentage}%.`);
    }
    if (job.min12thPercent && student.twelfthPercentage && student.twelfthPercentage < job.min12thPercent) {
      reasons.push(`Minimum 12th percentage required is ${job.min12thPercent}%. Your score is ${student.twelfthPercentage}%.`);
    }

    // Rule 4: Max Backlogs Allowed
    if (student.backlogs > job.maxBacklogs) {
      reasons.push(`Maximum active backlogs allowed is ${job.maxBacklogs}. You currently have ${student.backlogs} backlog(s).`);
    }

    // Rule 5: Branch Eligibility
    if (job.eligibleBranches && job.eligibleBranches.length > 0) {
      const isBranchAllowed = job.eligibleBranches.some(
        (b) => b.toLowerCase().includes(student.branch.toLowerCase()) || student.branch.toLowerCase().includes(b.toLowerCase())
      );
      if (!isBranchAllowed) {
        reasons.push(`Eligible branches for this drive: [${job.eligibleBranches.join(', ')}]. Your branch is '${student.branch}'.`);
      }
    }

    // Rule 6: Auto-Debar & Dream Offer Rule
    let isDreamOffer = false;
    if (student.placementStatus === 'Placed') {
      const currentPackage = student.placedPackage || 10.0;
      const newPackage = job.salaryPackage || 12.0;

      if (newPackage > 2 * currentPackage) {
        isDreamOffer = true;
      } else {
        reasons.push(`Auto-Debarred Rule: You are already placed at ${currentPackage} LPA (${student.placedCompany}). You can only apply to Dream Offer drives offering > 2x package (> ${(2 * currentPackage).toFixed(1)} LPA). This drive offers ${newPackage} LPA.`);
      }
    }

    const isEligible = reasons.length === 0;

    res.status(200).json({
      success: true,
      isEligible,
      isDreamOffer,
      reasons,
      studentData: {
        cgpa: student.cgpa,
        backlogs: student.backlogs,
        branch: student.branch,
        verificationStatus: student.verificationStatus,
        placementStatus: student.placementStatus
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    STAGE 2: Create new job drive & Automatically Calculate Batch Eligibility
// @route   POST /api/jobs
// @access  Private (Admin / Company)
exports.createJob = async (req, res, next) => {
  try {
    req.body.postedBy = req.user.id;

    if (req.user.role === 'company') {
      req.body.approvalStatus = 'Pending Admin Approval';
    } else {
      req.body.approvalStatus = 'Approved';
    }

    // Run Automatic Student Eligibility Calculation Engine
    const { eligibleCount, ineligibleCount, eligibilityPercentage } = await calculateBatchEligibility(req.body);
    req.body.eligibleStudentCount = eligibleCount;
    req.body.ineligibleStudentCount = ineligibleCount;
    req.body.eligibilityPercentage = eligibilityPercentage;

    const job = await Job.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Placement Job Drive published successfully.',
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stage 2: Admin approves or rejects job drive
// @route   PUT /api/jobs/:id/approve
// @access  Private (Admin)
exports.approveJobDrive = async (req, res, next) => {
  try {
    const { approvalStatus } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job drive not found' });
    }

    job.approvalStatus = approvalStatus;
    await job.save();

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Admin / Company)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Admin / Company)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    await job.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
