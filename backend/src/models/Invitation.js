const mongoose = require('mongoose');

const InvitationSchema = new mongoose.Schema(
  {
    recruiterName: {
      type: String,
      required: [true, 'Recruiter name is required'],
      trim: true
    },
    recruiterEmail: {
      type: String,
      required: [true, 'Recruiter email is required'],
      trim: true,
      lowercase: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['Sent', 'Accepted', 'JD Uploaded'],
      default: 'Sent'
    },
    emailLog: {
      subject: { type: String },
      sentAt: { type: Date, default: Date.now },
      status: { type: String, default: 'Delivered (Simulated Nodemailer)' }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Invitation', InvitationSchema);
