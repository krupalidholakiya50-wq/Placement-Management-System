const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  techStack: { type: String },
  githubUrl: { type: String }
});

const InternshipSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  duration: { type: String },
  description: { type: String }
});

const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: String },
  description: { type: String }
});

const CertificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String },
  year: { type: String },
  credentialUrl: { type: String }
});

const StudentDocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['10th Marksheet', '12th Marksheet', 'Semester Marksheet', 'Identity Card', 'Certificates', 'Resume'],
    required: true
  },
  documentUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
});

const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    studentId: {
      type: String,
      required: [true, 'Enrollment Number / Student ID is required'],
      unique: true,
      trim: true
    },
    registerNumber: {
      type: String,
      trim: true
    },
    photoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    fullName: {
      type: String,
      required: [true, 'Full Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      default: '+91 9876543210'
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male'
    },
    dob: {
      type: Date
    },
    address: {
      type: String
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      enum: ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil']
    },
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      default: 'B.Tech CSE'
    },
    semester: {
      type: String,
      default: '7th Semester'
    },
    year: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      default: '4th Year'
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10'],
      default: 8.5
    },
    tenthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 88.5
    },
    twelfthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 86.0
    },
    backlogs: {
      type: Number,
      default: 0,
      min: [0, 'Backlogs count cannot be negative']
    },
    linkedinUrl: { type: String },
    githubUrl: { type: String },
    portfolioUrl: { type: String },
    technicalSkills: {
      type: [String],
      default: ['Angular 20', 'TypeScript', 'Node.js', 'Express', 'MongoDB']
    },
    softSkills: {
      type: [String],
      default: ['Communication', 'Problem Solving', 'Team Leadership']
    },
    projects: [ProjectSchema],
    internships: [InternshipSchema],
    achievements: [AchievementSchema],
    certifications: [CertificationSchema],
    resumeUrl: {
      type: String,
      default: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    resumeVersions: [
      {
        title: { type: String, required: true },
        fileUrl: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    documents: [StudentDocumentSchema],
    // Profile Completion Percentage Engine (0% - 100%)
    profileCompletion: {
      type: Number,
      default: 80
    },
    // Stage 1 Verification & Mandatory Data Freeze Workflow
    verificationStatus: {
      type: String,
      enum: ['Draft', 'Pending Verification', 'Verified', 'Rejected'],
      default: 'Draft'
    },
    verificationNote: {
      type: String
    },
    isFrozen: {
      type: Boolean,
      default: false
    },
    placementStatus: {
      type: String,
      enum: ['Unplaced', 'Placed', 'Blacklisted', 'Opted Out'],
      default: 'Unplaced'
    },
    placedCompany: {
      type: String
    },
    placedPackage: {
      type: Number
    },
    blacklistedUntilDrives: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', StudentSchema);
