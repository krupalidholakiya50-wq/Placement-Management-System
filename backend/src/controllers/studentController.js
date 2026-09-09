const Student = require('../models/Student');
const User = require('../models/User');
const ExcelJS = require('exceljs');

// Helper function to calculate Profile Completion Percentage (0% - 100%)
const calculateProfileCompletion = (student) => {
  const fields = [
    { name: 'Full Name', value: student.fullName },
    { name: 'Enrollment Number', value: student.studentId },
    { name: 'Email', value: student.email },
    { name: 'Phone', value: student.phone },
    { name: 'Department', value: student.department },
    { name: 'Branch', value: student.branch },
    { name: 'Semester', value: student.semester },
    { name: 'CGPA', value: student.cgpa },
    { name: 'Technical Skills', value: student.technicalSkills && student.technicalSkills.length > 0 },
    { name: 'Projects', value: student.projects && student.projects.length > 0 },
    { name: 'Resume PDF', value: student.resumeUrl },
    { name: 'Documents', value: student.documents && student.documents.length > 0 }
  ];

  const completed = fields.filter((f) => !!f.value).length;
  const percentage = Math.round((completed / fields.length) * 100);
  const missingFields = fields.filter((f) => !f.value).map((f) => f.name);

  return { percentage, missingFields };
};

// @desc    STAGE 1: Upload PDF Resume File
// @route   POST /api/students/upload-resume
// @access  Public / Private
exports.uploadResumeFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a valid PDF file to upload.' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/resumes/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: '📄 Resume PDF uploaded successfully!',
      fileUrl
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students (Search & Multi-Filter supported)
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res, next) => {
  try {
    let query = {};

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      query.$or = [
        { fullName: regex },
        { studentId: regex },
        { email: regex },
        { branch: regex }
      ];
    }

    if (req.query.department) {
      query.department = req.query.department;
    }
    if (req.query.branch) {
      query.branch = req.query.branch;
    }
    if (req.query.semester) {
      query.semester = req.query.semester;
    }
    if (req.query.verificationStatus) {
      query.verificationStatus = req.query.verificationStatus;
    }
    if (req.query.placementStatus) {
      query.placementStatus = req.query.placementStatus;
    }

    if (req.query.minCgpa || req.query.maxCgpa) {
      query.cgpa = {};
      if (req.query.minCgpa) query.cgpa.$gte = Number(req.query.minCgpa);
      if (req.query.maxCgpa) query.cgpa.$lte = Number(req.query.maxCgpa);
    }

    const students = await Student.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's logged in profile
// @route   GET /api/students/profile/me
// @access  Private (Student)
exports.getStudentProfile = async (req, res, next) => {
  try {
    let student = await Student.findOne({ user: req.user.id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }

    if (!student) {
      student = await Student.create({
        user: req.user.id,
        studentId: 'STU' + Math.floor(100000 + Math.random() * 900000),
        fullName: req.user.name,
        email: req.user.email,
        department: req.user.department || 'Computer Science',
        branch: 'B.Tech CSE',
        semester: '7th Semester',
        year: '4th Year',
        cgpa: 8.5,
        backlogs: 0,
        verificationStatus: 'Draft'
      });
    }

    const { percentage, missingFields } = calculateProfileCompletion(student);
    student.profileCompletion = percentage;
    await student.save();

    res.status(200).json({
      success: true,
      data: student,
      completionPercentage: percentage,
      missingFields
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current logged-in student's profile
// @route   PUT /api/students/profile/me
// @access  Private (Student)
exports.updateStudentProfileMe = async (req, res, next) => {
  try {
    let student = await Student.findOne({ user: req.user.id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }

    if (!student) {
      student = await Student.create({
        user: req.user.id,
        studentId: req.body.studentId || 'STU' + Math.floor(100000 + Math.random() * 900000),
        fullName: req.body.fullName || req.user.name,
        email: req.user.email,
        department: req.body.department || req.user.department || 'Computer Science',
        branch: req.body.branch || 'B.Tech CSE',
        semester: req.body.semester || '7th Semester',
        year: req.body.year || '4th Year',
        cgpa: req.body.cgpa || 8.5,
        backlogs: req.body.backlogs || 0
      });
    }

    if (student.isFrozen && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '🔒 Profile Data is Frozen & Verified by TPO Cell. CGPA, Branch, Backlogs & Resume cannot be modified. Contact TPO Admin to request unlocking.'
      });
    }

    const updatedData = { ...req.body };
    const merged = { ...student.toObject(), ...updatedData };
    const { percentage, missingFields } = calculateProfileCompletion(merged);
    updatedData.profileCompletion = percentage;

    student = await Student.findByIdAndUpdate(student._id, updatedData, {
      new: true,
      runValidators: true
    });

    // Also update User record name & phone if provided
    if (req.body.fullName || req.body.phone) {
      await User.findByIdAndUpdate(req.user.id, {
        ...(req.body.fullName && { name: req.body.fullName }),
        ...(req.body.phone && { phone: req.body.phone })
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: student,
      completionPercentage: percentage,
      missingFields
    });
  } catch (error) {
    next(error);
  }
};


// @desc    STAGE 1: Submit profile for TPO Verification
// @route   POST /api/students/submit-verification
// @access  Private (Student)
exports.submitForVerification = async (req, res, next) => {
  try {
    let student = await Student.findOne({ user: req.user.id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (student.isFrozen) {
      return res.status(403).json({ success: false, message: 'Profile data is frozen and already verified by TPO.' });
    }

    student.verificationStatus = 'Pending Verification';
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Profile submitted to TPO Cell for Stage 1 Verification.',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    STAGE 1: Admin TPO verifies profile and FREEZES data
// @route   PUT /api/students/:id/verify
// @access  Private (Admin)
exports.verifyStudentProfile = async (req, res, next) => {
  try {
    const { action, note } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (action === 'approve') {
      student.verificationStatus = 'Verified';
      student.isFrozen = true;
      student.verificationNote = note || 'Verified by TPO Office. Academic credentials locked.';
    } else {
      student.verificationStatus = 'Rejected';
      student.isFrozen = false;
      student.verificationNote = note || 'Profile rejected. Please correct CGPA or resume details.';
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: action === 'approve' ? 'Student verified and data frozen.' : 'Student verification rejected.',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    STAGE 1: Admin TPO unlocks profile for student corrections
// @route   PUT /api/students/:id/unlock
// @access  Private (Admin)
exports.unlockStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    student.isFrozen = false;
    student.verificationStatus = 'Draft';
    student.verificationNote = 'Profile unlocked by TPO Officer for edits.';
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student profile unlocked for student updates.',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile (Protected by Data Freeze Guard)
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    if (student.isFrozen && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '🔒 Profile Data is Frozen & Verified by TPO Cell. CGPA, Branch, Backlogs & Resume cannot be modified. Contact TPO Admin to request unlocking.'
      });
    }

    const updatedData = { ...req.body };
    const merged = { ...student.toObject(), ...updatedData };
    const { percentage } = calculateProfileCompletion(merged);
    updatedData.profileCompletion = percentage;

    student = await Student.findByIdAndUpdate(req.params.id, updatedData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }
    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student record
// @route   POST /api/students
// @access  Private (Admin)
exports.createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student record
// @route   DELETE /api/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    await student.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Student record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    STAGE 1: Export Filtered Student Master List to Excel spreadsheet (.xlsx)
// @route   GET /api/students/export-excel
// @access  Private (Admin / Company)
exports.exportStudentsToExcel = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.department) query.department = req.query.department;
    if (req.query.branch) query.branch = req.query.branch;
    if (req.query.verificationStatus) query.verificationStatus = req.query.verificationStatus;
    if (req.query.placementStatus) query.placementStatus = req.query.placementStatus;
    if (req.query.minCgpa) query.cgpa = { $gte: Number(req.query.minCgpa) };

    const students = await Student.find(query).sort({ fullName: 1 });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Placement Management System TPO Office';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Master Students Directory');

    worksheet.columns = [
      { header: 'Student ID', key: 'studentId', width: 15 },
      { header: 'Full Name', key: 'fullName', width: 25 },
      { header: 'Email Address', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 18 },
      { header: 'Department', key: 'department', width: 22 },
      { header: 'Branch', key: 'branch', width: 18 },
      { header: 'CGPA', key: 'cgpa', width: 10 },
      { header: '10th %', key: 'tenthPercentage', width: 12 },
      { header: '12th %', key: 'twelfthPercentage', width: 12 },
      { header: 'Backlogs', key: 'backlogs', width: 12 },
      { header: 'Verification Status', key: 'verificationStatus', width: 22 },
      { header: 'Placement Status', key: 'placementStatus', width: 18 },
      { header: 'Placed Company', key: 'placedCompany', width: 22 },
      { header: 'Package (LPA)', key: 'placedPackage', width: 16 }
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E293B' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    headerRow.height = 24;

    students.forEach((s) => {
      worksheet.addRow({
        studentId: s.studentId,
        fullName: s.fullName,
        email: s.email,
        phone: s.phone || 'N/A',
        department: s.department,
        branch: s.branch,
        cgpa: s.cgpa,
        tenthPercentage: s.tenthPercentage || 85.0,
        twelfthPercentage: s.twelfthPercentage || 85.0,
        backlogs: s.backlogs || 0,
        verificationStatus: s.verificationStatus,
        placementStatus: s.placementStatus,
        placedCompany: s.placedCompany || 'Unplaced',
        placedPackage: s.placedPackage || 0
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=TPO_Master_Students_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    next(error);
  }
};

// @desc    STAGE 1: Bulk verify multiple students by Admin TPO
// @route   POST /api/students/bulk-verify
// @access  Private (Admin)
exports.bulkVerifyStudents = async (req, res, next) => {
  try {
    const { studentIds, action, note } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide array of student IDs' });
    }

    const updatePayload = action === 'approve'
      ? { verificationStatus: 'Verified', isFrozen: true, verificationNote: note || 'Bulk verified by TPO Office.' }
      : { verificationStatus: 'Rejected', isFrozen: false, verificationNote: note || 'Bulk rejected by TPO Office.' };

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: updatePayload }
    );

    res.status(200).json({
      success: true,
      message: `Successfully processed ${result.modifiedCount} student profiles.`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add / Update Resume Version in Student Profile Repository
// @route   POST /api/students/resume-version
// @access  Private (Student)
exports.addResumeVersion = async (req, res, next) => {
  try {
    const { title, fileUrl, isPrimary } = req.body;

    let student = await Student.findOne({ user: req.user.id });
    if (!student) student = await Student.findOne({ email: req.user.email });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    if (isPrimary) {
      student.resumeVersions.forEach((v) => (v.isPrimary = false));
      student.resumeUrl = fileUrl;
    }

    student.resumeVersions.push({
      title: title || 'Custom Resume Version',
      fileUrl,
      isPrimary: isPrimary || student.resumeVersions.length === 0
    });

    if (student.resumeVersions.length === 1) {
      student.resumeUrl = fileUrl;
    }

    await student.save();

    res.status(200).json({
      success: true,
      message: 'New resume version added to repository',
      data: student
    });
  } catch (error) {
    next(error);
  }
};
