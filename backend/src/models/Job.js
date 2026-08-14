const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required']
    },
    companyLogo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=120&q=80'
    },
    description: {
      type: String,
      required: [true, 'Job description is required']
    },
    salaryPackage: {
      type: Number,
      required: [true, 'CTC Salary package in LPA is required'],
      default: 12.0
    },
    location: {
      type: String,
      required: [true, 'Job location is required'],
      default: 'Bangalore / Remote'
    },
    jobType: {
      type: String,
      enum: ['Full Time', 'Internship', 'Internship + Full Time'],
      default: 'Full Time'
    },
    // Eligibility Criteria
    minCgpa: {
      type: Number,
      required: [true, 'Minimum CGPA criteria is required'],
      default: 7.5
    },
    min10thPercent: {
      type: Number,
      default: 60.0
    },
    min12thPercent: {
      type: Number,
      default: 60.0
    },
    maxBacklogs: {
      type: Number,
      default: 0
    },
    eligibleBranches: {
      type: [String],
      default: ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE']
    },
    allowedSemesters: {
      type: [String],
      default: ['7th Semester', '8th Semester']
    },
    passingYear: {
      type: String,
      default: '2026 Batch'
    },
    selectionProcess: {
      type: String,
      default: 'Online Coding Test -> Technical Interview -> HR Round'
    },
    driveRounds: [
      {
        roundNumber: { type: Number, required: true },
        name: { type: String, required: true },
        description: { type: String },
        scheduledDate: { type: Date },
        status: { type: String, enum: ['Upcoming', 'In Progress', 'Completed'], default: 'Upcoming' }
      }
    ],
    bond: {
      type: String,
      default: 'No Service Bond'
    },
    openPositions: {
      type: Number,
      default: 15
    },
    deadline: {
      type: Date,
      required: [true, 'Application deadline is required']
    },
    driveDate: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    },
    // Automatic Student Eligibility Engine Outputs
    eligibleStudentCount: {
      type: Number,
      default: 0
    },
    ineligibleStudentCount: {
      type: Number,
      default: 0
    },
    eligibilityPercentage: {
      type: Number,
      default: 0
    },
    // Workflow Approval
    approvalStatus: {
      type: String,
      enum: ['Pending Admin Approval', 'Approved', 'Rejected'],
      default: 'Approved'
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Upcoming'],
      default: 'Active'
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Job', JobSchema);
