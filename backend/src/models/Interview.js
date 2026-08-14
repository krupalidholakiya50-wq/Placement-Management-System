const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    studentName: { type: String, required: true },
    companyName: { type: String, required: true },
    roundName: {
      type: String,
      enum: ['Online Assessment', 'Tech Round 1', 'Tech Round 2', 'HR Round'],
      default: 'Tech Round 1'
    },
    interviewDate: {
      type: Date,
      required: [true, 'Interview Date is required']
    },
    interviewTime: {
      type: String,
      required: [true, 'Interview Time is required'],
      default: '10:30 AM'
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline'],
      default: 'Online'
    },
    venue: {
      type: String,
      default: 'TPO Seminar Hall 2 / Online Link'
    },
    meetingLink: {
      type: String,
      default: 'https://meet.google.com/abc-defg-hij'
    },
    panelName: {
      type: String,
      default: 'Technical Hiring Panel A'
    },
    remarks: {
      type: String,
      default: 'Please carry updated resume and student ID card.'
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
      default: 'Scheduled'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Interview', InterviewSchema);
