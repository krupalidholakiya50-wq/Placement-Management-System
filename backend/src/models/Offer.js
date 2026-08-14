const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema(
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
    role: { type: String, required: true },
    packageOffered: {
      type: Number,
      required: [true, 'Salary package CTC in LPA is required'],
      default: 12.0
    },
    location: { type: String, default: 'Bangalore' },
    joiningDate: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    },
    offerLetterUrl: {
      type: String,
      default: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Offer', OfferSchema);
