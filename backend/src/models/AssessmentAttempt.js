const mongoose = require('mongoose');

const AssessmentAttemptSchema = new mongoose.Schema(
  {
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
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
    answers: [
      {
        questionIndex: {
          type: Number,
          required: true
        },
        selectedOption: {
          type: Number,
          required: true
        },
        isCorrect: {
          type: Boolean
        }
      }
    ],
    score: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    passed: {
      type: Boolean,
      default: false
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    submittedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['In Progress', 'Submitted', 'Timed Out'],
      default: 'In Progress'
    }
  },
  {
    timestamps: true
  }
);

AssessmentAttemptSchema.index({ assessment: 1, student: 1 });

module.exports = mongoose.model('AssessmentAttempt', AssessmentAttemptSchema);
