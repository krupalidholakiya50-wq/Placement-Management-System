const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'JOB_POSTED',
        'APPLICATION_SUBMITTED',
        'STATUS_UPDATED',
        'OFFER_EXTENDED',
        'STUDENT_VERIFIED',
        'COMPANY_APPROVED',
        'INTERVIEW_SCHEDULED',
        'NOTICE_PUBLISHED',
        'STUDENT_UNLOCKED',
        'STUDENT_BLACKLISTED',
        'COMPANY_SUSPENDED',
        'OFFER_ACCEPTED',
        'OFFER_DECLINED'
      ],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    actor: {
      type: String,
      default: 'Placement Office'
    },
    actorRole: {
      type: String,
      enum: ['admin', 'student', 'company', 'system'],
      default: 'system'
    },
    targetBranch: {
      type: String,
      default: 'All Branches'
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    timestamps: true
  }
);

// Index for high performance query sorting
ActivitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
