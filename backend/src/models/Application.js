const mongoose = require('mongoose');

const StatusTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      'Applied',
      'Resume Shortlisted',
      'Aptitude Test Cleared',
      'Group Discussion Cleared',
      'Technical Interview Cleared',
      'HR Interview Cleared',
      'Selected',
      'Rejected',
      'Shortlisted',
      'Online Test',
      'Tech Interview',
      'HR Interview',
      'No Show'
    ],
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: 'Application status updated by TPO / Recruiter.'
  }
});

const ApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job drive reference is required']
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student profile reference is required']
    },
    studentUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    studentName: {
      type: String,
      required: true
    },
    studentEmail: {
      type: String,
      required: true
    },
    department: {
      type: String
    },
    branch: {
      type: String
    },
    cgpa: {
      type: Number
    },
    backlogs: {
      type: Number,
      default: 0
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume PDF link is required']
    },
    status: {
      type: String,
      enum: [
        'Applied',
        'Resume Shortlisted',
        'Aptitude Test Cleared',
        'Group Discussion Cleared',
        'Technical Interview Cleared',
        'HR Interview Cleared',
        'Selected',
        'Rejected',
        'Shortlisted',
        'Online Test',
        'Tech Interview',
        'HR Interview',
        'No Show'
      ],
      default: 'Applied'
    },
    statusTimeline: [StatusTimelineSchema],
    appliedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Ensure unique application per student per job drive
ApplicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', ApplicationSchema);
