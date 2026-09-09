const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['General Notice', 'Campus Drive', 'Interview Schedule', 'Shortlist Alert', 'Policy Update'],
      default: 'Campus Drive'
    },
    companyName: {
      type: String,
      default: 'University T&P Cell'
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    role: { type: String, default: 'Multiple Roles' },
    packageOffered: { type: String, default: 'As per Industry Standards' },
    eligibilityCriteria: { type: String, default: 'All Eligible 2026 Batch Students' },
    targetBranch: { type: String, default: 'All Branches' },
    priority: { type: String, enum: ['Urgent', 'High', 'Normal'], default: 'Normal' },
    content: { type: String, required: true },
    isEmailSent: { type: Boolean, default: true },
    broadcastChannels: {
      type: [String],
      default: ['Student Portal', 'Email Notification', 'WhatsApp Alert']
    },
    alertLogs: [
      {
        channel: { type: String },
        recipientCount: { type: Number, default: 0 },
        sentAt: { type: Date, default: Date.now },
        status: { type: String, default: 'Delivered' }
      }
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notice', NoticeSchema);

