const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientRole: {
      type: String,
      enum: ['admin', 'student', 'company'],
      default: 'student'
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    type: {
      type: String,
      enum: [
        'DRIVE_ANNOUNCEMENT',
        'APPLICATION_UPDATE',
        'ASSESSMENT_INVITATION',
        'ASSESSMENT_RESULT',
        'INTERVIEW_SCHEDULED',
        'OFFER_EXTENDED',
        'STUDENT_VERIFICATION',
        'COMPANY_APPROVAL',
        'EMAIL_RECEIVED',
        'DIRECT_MESSAGE',
        'SYSTEM_ALERT'
      ],
      default: 'SYSTEM_ALERT'
    },
    relatedEntity: {
      type: String,
      enum: ['Job', 'Application', 'Assessment', 'Interview', 'Offer', 'Student', 'Company', 'Notice', 'System', null],
      default: null
    },
    relatedEntityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    link: {
      type: String,
      default: '/dashboard'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
