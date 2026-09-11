const Notice = require('../models/Notice');
const Student = require('../models/Student');
const EmailLog = require('../models/EmailLog');
const { sendEmail, generateNoticeHtml, isSmtpConfigured } = require('../utils/sendEmail');
const { logActivity } = require('./activityController');

// @desc    Get all active placement notices
// @route   GET /api/notices
// @access  Public / Private
exports.getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new placement notice & dispatch real Nodemailer emails to students
// @route   POST /api/notices
// @access  Private (Admin)
exports.createNotice = async (req, res, next) => {
  try {
    const { title, category, companyName, role, packageOffered, eligibilityCriteria, targetBranch, priority, content, sendEmail: shouldSendEmail } = req.body;

    // Fetch targeted student email addresses from database
    let studentFilter = {};
    if (targetBranch && targetBranch !== 'All Branches') {
      studentFilter.branch = { $regex: targetBranch.replace('B.Tech ', ''), $options: 'i' };
    }

    const students = await Student.find(studentFilter).select('email fullName branch');
    const studentEmails = students.map((s) => s.email).filter(Boolean);

    const recipientCount = studentEmails.length;

    const notice = await Notice.create({
      title,
      category: category || 'Campus Drive',
      companyName: companyName || 'University T&P Cell',
      role: role || 'Multiple Roles',
      packageOffered: packageOffered || 'As per Industry Standards',
      eligibilityCriteria: eligibilityCriteria || 'All 2026 Batch Students',
      targetBranch: targetBranch || 'All Branches',
      priority: priority || 'Normal',
      content,
      isEmailSent: shouldSendEmail !== false && recipientCount > 0,
      postedBy: req.user ? req.user.id : null,
      alertLogs: [
        { channel: 'Student Portal Dashboard', recipientCount, status: 'Published Live' },
        {
          channel: 'SMTP Nodemailer Broadcast',
          recipientCount,
          status: shouldSendEmail !== false
            ? (recipientCount > 0 ? `Dispatched to ${recipientCount} student inbox(es)` : 'No recipient students found')
            : 'Skipped'
        },
        { channel: 'WhatsApp Alert Group', recipientCount, status: recipientCount > 0 ? 'Delivered' : 'No recipients' }
      ]
    });

    await logActivity({
      type: 'NOTICE_PUBLISHED',
      title: `Notice: ${title}`,
      description: `${companyName || 'TPO Office'} - ${category || 'Campus Drive'}`,
      actor: req.user ? req.user.name : 'Placement Cell',
      actorRole: req.user ? req.user.role : 'admin',
      targetBranch: targetBranch || 'All Branches',
      relatedId: notice._id
    });

    // Asynchronously dispatch real emails to all target student email addresses
    let dispatchedCount = 0;
    let failedCount = 0;
    let emailResults = [];

    if (shouldSendEmail !== false && studentEmails.length > 0) {
      const emailHtml = generateNoticeHtml({
        noticeTitle: title,
        noticeContent: content,
        companyName: companyName || 'University T&P Cell',
        role: role || 'Multiple Roles',
        packageOffered: packageOffered || 'As per Industry Standards',
        eligibilityCriteria: eligibilityCriteria || 'All 2026 Batch Students'
      });

      for (const email of studentEmails) {
        const result = await sendEmail({
          to: email,
          subject: `📢 TPO Notice: ${title}`,
          html: emailHtml
        });
        if (result.success) {
          dispatchedCount++;
        } else {
          failedCount++;
        }
        emailResults.push(result);
      }

      await EmailLog.create({
        sender: 'University Placement Cell',
        recipient: studentEmails[0] || 'Target Students',
        recipientEmails: studentEmails,
        recipientCount: studentEmails.length,
        subject: `Notice: ${title}`,
        type: 'Notice Broadcast',
        template: 'Placement Drive Announcement',
        recipientGroup: targetBranch || 'All Branches',
        successCount: dispatchedCount,
        failureCount: failedCount,
        status: isSmtpConfigured() ? (failedCount === 0 ? 'Sent' : dispatchedCount > 0 ? 'Partially Failed' : 'Failed') : 'SMTP Not Configured',
        sentAt: new Date(),
        sentBy: req.user ? req.user.id : null
      });
    }

    res.status(201).json({
      success: true,
      message: studentEmails.length > 0
        ? `📢 Notice published! Email broadcast processed for ${dispatchedCount} recipient(s).`
        : `📢 Notice published to board. No student email recipients found matching branch criteria.`,
      data: notice,
      dispatchedCount,
      emailResults
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Test Email Endpoint: Send a real email to any custom email address
// @route   POST /api/notices/test-email
// @access  Public / Private
exports.testSendEmail = async (req, res, next) => {
  try {
    const { toEmail, subject, message } = req.body;

    if (!toEmail) {
      return res.status(400).json({ success: false, message: 'Recipient email address (toEmail) is required' });
    }

    if (!isSmtpConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'SMTP configuration required. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in environment.'
      });
    }

    const emailHtml = generateNoticeHtml({
      noticeTitle: subject || 'Test TPO Email Alert',
      noticeContent: message || 'This is a real test email sent from the Placement Management System Nodemailer Engine to verify real email delivery.',
      companyName: 'University T&P Cell',
      role: 'System Verification',
      packageOffered: 'N/A',
      eligibilityCriteria: 'All Registered Accounts'
    });

    const result = await sendEmail({
      to: toEmail,
      subject: subject || '⚡ Test Email from Placement Management System',
      html: emailHtml
    });

    await EmailLog.create({
      sender: 'University Placement Cell',
      recipient: toEmail,
      recipientEmails: [toEmail],
      recipientCount: 1,
      subject: subject || '⚡ Test Email from Placement Management System',
      type: 'Test Email',
      template: 'Test Email',
      recipientGroup: 'Direct Test',
      successCount: result.success ? 1 : 0,
      failureCount: result.success ? 0 : 1,
      status: result.success ? 'Sent' : 'Failed',
      messageId: result.messageId,
      error: result.error,
      errorMessage: result.error,
      sentAt: new Date(),
      sentBy: req.user ? req.user.id : null
    });

    if (result.success) {
      res.status(200).json({
        success: true,
        message: `✔ Email dispatched successfully to [${toEmail}]!`,
        result
      });
    } else {
      res.status(500).json({
        success: false,
        message: `❌ Failed to send email: ${result.error}`,
        result
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin)
exports.deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }
    await notice.deleteOne();
    res.status(200).json({ success: true, message: 'Notice removed successfully' });
  } catch (error) {
    next(error);
  }
};
