const EmailLog = require('../models/EmailLog');
const Student = require('../models/Student');
const User = require('../models/User');
const { sendEmail, isSmtpConfigured } = require('../utils/sendEmail');
const { logActivity } = require('./activityController');

// @desc    Get email dispatch history logs
// @route   GET /api/emails/logs
// @access  Private (Admin)
exports.getEmailLogs = async (req, res, next) => {
  try {
    const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(100);
    const smtpStatus = isSmtpConfigured();

    res.status(200).json({
      success: true,
      isSmtpConfigured: smtpStatus,
      smtpHost: process.env.SMTP_HOST || null,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get SMTP configuration status and email counts
// @route   GET /api/emails/status
// @access  Private (Admin)
exports.getSmtpStatus = async (req, res, next) => {
  try {
    const isConfigured = isSmtpConfigured();
    const total = await EmailLog.countDocuments();
    const delivered = await EmailLog.countDocuments({ status: { $in: ['Sent', 'Delivered'] } });
    const failed = await EmailLog.countDocuments({ status: { $in: ['Failed', 'SMTP Not Configured', 'Partially Failed'] } });

    res.status(200).json({
      success: true,
      isConfigured,
      message: isConfigured
        ? 'SMTP email service is actively configured.'
        : 'SMTP configuration required. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.',
      counts: {
        total,
        delivered,
        failed
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send bulk or custom broadcast email via Email Center
// @route   POST /api/emails/send
// @access  Private (Admin)
exports.sendBroadcastEmail = async (req, res, next) => {
  try {
    const { to, subject, message, html, recipientGroup, targetBranch, customEmails, template, type, templateType } = req.body;

    if (!subject || (!message && !html)) {
      return res.status(400).json({ success: false, message: 'Subject and message body are required' });
    }

    let targetEmails = [];

    if (to) {
      if (Array.isArray(to)) {
        targetEmails = to.filter(Boolean);
      } else if (typeof to === 'string') {
        targetEmails = to.split(',').map((e) => e.trim()).filter(Boolean);
      }
    } else if (recipientGroup === 'Specific Branch' && targetBranch) {
      const students = await Student.find({ branch: { $regex: targetBranch.replace('B.Tech ', ''), $options: 'i' } }).select('email');
      targetEmails = students.map((s) => s.email).filter(Boolean);
    } else if (recipientGroup === 'All Students') {
      const students = await Student.find().select('email');
      targetEmails = students.map((s) => s.email).filter(Boolean);
    } else if (recipientGroup === 'Verified Students Only') {
      const students = await Student.find({ verificationStatus: 'Verified' }).select('email');
      targetEmails = students.map((s) => s.email).filter(Boolean);
    } else if (recipientGroup === 'Recruiters') {
      const recruiters = await User.find({ role: 'company' }).select('email');
      targetEmails = recruiters.map((r) => r.email).filter(Boolean);
    } else if (customEmails && Array.isArray(customEmails)) {
      targetEmails = customEmails.filter(Boolean);
    } else if (typeof customEmails === 'string') {
      targetEmails = customEmails.split(',').map((e) => e.trim()).filter(Boolean);
    }

    if (targetEmails.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid recipient email addresses found for the chosen audience group.' });
    }

    const smtpConfigured = isSmtpConfigured();

    if (!smtpConfigured) {
      // Record failure log honestly
      const emailLog = await EmailLog.create({
        sender: 'University Placement Cell',
        recipient: targetEmails[0] || 'Unspecified',
        recipientEmails: targetEmails,
        recipientCount: targetEmails.length,
        subject,
        type: type || templateType || 'Notice Broadcast',
        template: template || 'Custom Broadcast',
        recipientGroup: recipientGroup || 'Custom Recipients',
        successCount: 0,
        failureCount: targetEmails.length,
        status: 'SMTP Not Configured',
        error: 'SMTP configuration required. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.',
        errorMessage: 'SMTP_HOST / SMTP_USER not configured in server environment. Email dispatch was skipped.',
        sentAt: new Date(),
        sentBy: req.user ? req.user.id : null
      });

      return res.status(200).json({
        success: false,
        isSmtpConfigured: false,
        message: 'SMTP configuration required. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.',
        data: emailLog
      });
    }

    // SMTP is configured -> Actually dispatch emails
    let successCount = 0;
    let failureCount = 0;
    let lastError = null;
    let lastMessageId = null;

    const emailHtml = html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff; padding: 25px; border-radius: 12px; border: 1px solid #e2e8f0;">
        <div style="background: #090d16; color: #fff; padding: 20px; border-radius: 8px; text-align: center;">
          <h2 style="margin: 0; color: #38bdf8;">🎓 University Placement Cell</h2>
          <p style="margin: 5px 0 0; font-size: 12px; color: #94a3b8;">CAMPUS RECRUITMENT COMMUNICATION</p>
        </div>
        <div style="padding: 20px 0;">
          <h3 style="color: #0f172a; margin-top: 0;">${subject}</h3>
          <p style="color: #334155; line-height: 1.7; white-space: pre-line;">${message || ''}</p>
        </div>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0;">
          Training & Placement Cell • University Campus • 2026 Batch
        </div>
      </div>
    `;

    for (const recipientEmail of targetEmails) {
      const resSend = await sendEmail({
        to: recipientEmail,
        subject: `📢 TPO Official: ${subject}`,
        html: emailHtml,
        text: message
      });
      if (resSend.success) {
        successCount++;
        lastMessageId = resSend.messageId;
      } else {
        failureCount++;
        lastError = resSend.error;
      }
    }

    const logStatus = failureCount === 0 ? 'Sent' : successCount > 0 ? 'Partially Failed' : 'Failed';

    const emailLog = await EmailLog.create({
      sender: 'University Placement Cell',
      recipient: targetEmails[0] || 'Unspecified',
      recipientEmails: targetEmails,
      recipientCount: targetEmails.length,
      subject,
      type: type || templateType || 'Notice Broadcast',
      template: template || 'Custom Broadcast',
      recipientGroup: recipientGroup || 'Custom Recipients',
      successCount,
      failureCount,
      status: logStatus,
      messageId: lastMessageId,
      error: lastError,
      errorMessage: lastError,
      sentAt: new Date(),
      sentBy: req.user ? req.user.id : null
    });

    await logActivity({
      type: 'NOTICE_PUBLISHED',
      title: `Email Broadcast: ${subject}`,
      description: `Dispatched to ${successCount} recipient(s) via SMTP (${recipientGroup || 'Direct'})`,
      actor: req.user ? req.user.name : 'Placement Cell',
      actorRole: req.user ? req.user.role : 'admin',
      targetBranch: targetBranch || 'All Branches',
      relatedId: emailLog._id
    });

    res.status(200).json({
      success: successCount > 0,
      isSmtpConfigured: true,
      message: `Email dispatch complete! Successfully sent to ${successCount} recipient(s). (Failed: ${failureCount})`,
      data: emailLog
    });
  } catch (error) {
    next(error);
  }
};
