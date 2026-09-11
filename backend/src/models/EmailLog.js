const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      trim: true
    },
    recipientEmails: {
      type: [String],
      default: []
    },
    recipientCount: {
      type: Number,
      default: 1
    },
    sender: {
      type: String,
      default: 'University Placement Cell'
    },
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true
    },
    type: {
      type: String,
      default: 'Notice Broadcast'
    },
    template: {
      type: String,
      default: 'Custom Broadcast'
    },
    recipientGroup: {
      type: String,
      default: 'Custom Recipients'
    },
    successCount: {
      type: Number,
      default: 0
    },
    failureCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Sent', 'Delivered', 'Partially Failed', 'Failed', 'SMTP Not Configured'],
      default: 'Sent'
    },
    messageId: {
      type: String
    },
    error: {
      type: String
    },
    errorMessage: {
      type: String
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

EmailLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('EmailLog', EmailLogSchema);
