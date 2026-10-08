const mongoose = require('mongoose');

const EmailLogSchema = new mongoose.Schema(
  {
    threadId: {
      type: String,
      index: true
    },
    messageId: {
      type: String,
      index: true
    },
    inReplyTo: {
      type: String
    },
    references: {
      type: [String],
      default: []
    },
    sender: {
      type: String,
      default: 'University Placement Cell'
    },
    senderName: {
      type: String
    },
    senderEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    senderRole: {
      type: String,
      enum: ['admin', 'student', 'company', 'system'],
      default: 'admin'
    },
    recipient: {
      type: String,
      trim: true
    },
    recipientName: {
      type: String
    },
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recipientRole: {
      type: String,
      enum: ['admin', 'student', 'company', 'all', 'custom'],
      default: 'custom'
    },
    recipientEmails: {
      type: [String],
      default: []
    },
    cc: {
      type: [String],
      default: []
    },
    recipientCount: {
      type: Number,
      default: 1
    },
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true
    },
    body: {
      type: String,
      default: ''
    },
    html: {
      type: String,
      default: ''
    },
    direction: {
      type: String,
      enum: ['outbound', 'inbound'],
      default: 'outbound'
    },
    type: {
      type: String,
      default: 'Direct Message'
    },
    template: {
      type: String,
      default: 'Custom Dispatch'
    },
    recipientGroup: {
      type: String,
      default: 'Direct'
    },
    relatedEntity: {
      type: String,
      enum: ['Assessment', 'Interview', 'Offer', 'Job', 'Application', 'Notice', 'Company', 'Student', 'System', null],
      default: null
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    attachments: [
      {
        filename: { type: String },
        contentType: { type: String },
        size: { type: Number },
        url: { type: String },
        diskPath: { type: String }
      }
    ],
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
      enum: ['Sent', 'Delivered', 'Partially Failed', 'Failed', 'SMTP Not Configured', 'Received', 'Draft'],
      default: 'Sent'
    },
    deliveryStatus: {
      type: String,
      enum: ['QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'RECEIVED', 'DRAFT'],
      default: 'SENT'
    },
    providerMessageId: {
      type: String
    },
    error: {
      type: String
    },
    errorMessage: {
      type: String
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    receivedAt: {
      type: Date
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

EmailLogSchema.index({ recipient: 1, isRead: 1 });
EmailLogSchema.index({ recipientEmail: 1, isRead: 1 });
EmailLogSchema.index({ recipientId: 1, isRead: 1 });
EmailLogSchema.index({ senderId: 1 });
EmailLogSchema.index({ threadId: 1, createdAt: 1 });
EmailLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('EmailLog', EmailLogSchema);

