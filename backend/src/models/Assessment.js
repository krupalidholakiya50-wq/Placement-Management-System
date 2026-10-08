const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['MCQ', 'Multiple Choice'],
    default: 'MCQ'
  },
  options: {
    type: [String],
    required: [true, 'Question options are required'],
    validate: [arr => arr.length >= 2, 'Question must have at least 2 options']
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Correct option index is required'],
    min: 0
  },
  marks: {
    type: Number,
    default: 1,
    min: 1
  }
});

const AssessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    companyName: {
      type: String,
      default: 'University T&P Cell'
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Placement Drive reference is required']
    },
    jobTitle: {
      type: String,
      default: 'Campus Drive Role'
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      default: 30,
      min: 5
    },
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },
    totalMarks: {
      type: Number,
      default: 100
    },
    passingMarks: {
      type: Number,
      default: 40
    },
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Draft'
    },
    questions: [QuestionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

AssessmentSchema.index({ job: 1, status: 1 });

module.exports = mongoose.model('Assessment', AssessmentSchema);
