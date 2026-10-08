const crypto = require('crypto');
const EmailLog = require('../models/EmailLog');
const Student = require('../models/Student');
const Company = require('../models/Company');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { 
  sendEmail, 
  generateDirectEmailHtml, 
  isSmtpConfigured, 
  verifySmtpConnection, 
  getMissingSmtpConfig 
} = require('../utils/sendEmail');
const { logActivity } = require('./activityController');

/**
 * Helper to normalize email addresses
 */
const normalizeEmail = (email) => {
  return email ? email.trim().toLowerCase() : '';
};

/**
 * Internal helper to query user's inbox filter
 */
const buildInboxFilter = (user) => {
  const userEmail = normalizeEmail(user.email);
  const userId = user.id || user._id;
  const userRole = user.role || 'student';
  const notDraft = { status: { $ne: 'Draft' } };

  if (userRole === 'admin') {
    return {
      ...notDraft,
      $or: [
        { recipient: userEmail },
        { recipientEmail: userEmail },
        { recipientEmails: userEmail },
        { recipientId: userId },
        { recipientRole: { $in: ['admin', 'all'] } },
        { recipientGroup: 'Placement Office' }
      ]
    };
  } else if (userRole === 'company') {
    return {
      ...notDraft,
      $or: [
        { recipient: userEmail },
        { recipientEmail: userEmail },
        { recipientEmails: userEmail },
        { recipientId: userId },
        { recipientRole: { $in: ['company', 'all'] } },
        { recipientGroup: 'Recruiters' }
      ]
    };
  } else {
    // Student receives student-targeted communication
    return {
      ...notDraft,
      $or: [
        { recipient: userEmail },
        { recipientEmail: userEmail },
        { recipientEmails: userEmail },
        { recipientId: userId },
        { recipientRole: { $in: ['student', 'all'] } },
        { recipientGroup: { $in: ['All Students', 'Verified Students Only', 'All Branches', user.department || ''] } }
      ]
    };
  }
};

// @desc    Get user's live mailbox inbox
// @route   GET /api/emails/inbox
// @access  Private
exports.getInbox = async (req, res, next) => {
  try {
    const baseFilter = buildInboxFilter(req.user);
    const filter = { ...baseFilter };

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.$and = [
        { ...baseFilter },
        {
          $or: [
            { subject: regex },
            { sender: regex },
            { senderName: regex },
            { senderEmail: regex },
            { body: regex },
            { type: regex }
          ]
        }
      ];
    }

    if (req.query.type && req.query.type !== 'ALL') {
      filter.type = req.query.type;
    }

    if (req.query.isRead !== undefined && req.query.isRead !== '') {
      filter.isRead = req.query.isRead === 'true';
    }

    const sortOrder = req.query.sort === 'oldest' ? 1 : -1;
    const limit = parseInt(req.query.limit, 10) || 100;

    const [emails, unreadCount] = await Promise.all([
      EmailLog.find(filter).sort({ createdAt: sortOrder }).limit(limit),
      EmailLog.countDocuments({ ...baseFilter, isRead: false })
    ]);

    res.status(200).json({
      success: true,
      count: emails.length,
      unreadCount,
      data: emails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's sent emails / Admin complete sent dispatch history
// @route   GET /api/emails/sent
// @access  Private
exports.getSent = async (req, res, next) => {
  try {
    const userEmail = normalizeEmail(req.user.email);
    const userId = req.user.id || req.user._id;
    let filter = { status: { $ne: 'Draft' } };

    if (req.user.role === 'admin') {
      if (req.query.search) {
        const regex = new RegExp(req.query.search, 'i');
        filter.$and = [
          { status: { $ne: 'Draft' } },
          {
            $or: [
              { subject: regex },
              { recipient: regex },
              { recipientEmail: regex },
              { sender: regex },
              { senderEmail: regex },
              { body: regex },
              { type: regex }
            ]
          }
        ];
      }
    } else {
      const userCondition = {
        $or: [
          { senderId: userId },
          { sentBy: userId },
          { senderEmail: userEmail }
        ]
      };

      if (req.query.search) {
        const regex = new RegExp(req.query.search, 'i');
        filter.$and = [
          userCondition,
          { status: { $ne: 'Draft' } },
          {
            $or: [
              { subject: regex },
              { recipient: regex },
              { recipientEmail: regex },
              { body: regex },
              { type: regex }
            ]
          }
        ];
      } else {
        filter = {
          ...userCondition,
          status: { $ne: 'Draft' }
        };
      }
    }

    const emails = await EmailLog.find(filter).sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
      success: true,
      count: emails.length,
      data: emails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread email count for authenticated user
// @route   GET /api/emails/unread-count
// @access  Private
exports.getUnreadCount = async (req, res, next) => {
  try {
    const baseFilter = buildInboxFilter(req.user);
    const count = await EmailLog.countDocuments({ ...baseFilter, isRead: false });

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single email details & mark as read
// @route   GET /api/emails/:id
// @access  Private
exports.getEmailById = async (req, res, next) => {
  try {
    const email = await EmailLog.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email record not found.' });
    }

    if (!email.isRead) {
      email.isRead = true;
      email.readAt = new Date();
      await email.save();
    }

    res.status(200).json({
      success: true,
      data: email
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single email as read
// @route   PATCH /api/emails/:id/read
// @access  Private
exports.markEmailAsRead = async (req, res, next) => {
  try {
    const email = await EmailLog.findById(req.params.id);
    if (!email) {
      return res.status(404).json({ success: false, message: 'Email not found.' });
    }

    email.isRead = true;
    email.readAt = new Date();
    await email.save();

    res.status(200).json({
      success: true,
      message: 'Email marked as read.',
      data: email
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all inbox emails as read for user
// @route   PATCH /api/emails/mark-all-read
// @access  Private
exports.markAllEmailsAsRead = async (req, res, next) => {
  try {
    const baseFilter = buildInboxFilter(req.user);
    const result = await EmailLog.updateMany(
      { ...baseFilter, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} emails as read.`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get directory contacts for recipient auto-complete
// @route   GET /api/emails/contacts
// @access  Private
exports.getContacts = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    let students = [];
    let companies = [];
    let admins = [];

    if (userRole === 'company' || userRole === 'admin') {
      students = await Student.find({}, 'fullName email studentId department branch cgpa verificationStatus photoUrl')
        .sort({ fullName: 1 })
        .limit(100);
    }

    if (userRole === 'student' || userRole === 'admin') {
      companies = await Company.find({}, 'name hrName hrEmail industry logoUrl location')
        .sort({ name: 1 })
        .limit(100);
    }

    admins = await User.find({ role: 'admin' }, 'name email avatar department').limit(10);

    const formattedContacts = [];

    // Format students
    students.forEach((s) => {
      formattedContacts.push({
        id: s._id,
        type: 'student',
        name: s.fullName,
        email: s.email,
        subtitle: `${s.studentId} • ${s.branch} (CGPA: ${s.cgpa})`,
        avatar: s.photoUrl
      });
    });

    // Format companies
    companies.forEach((c) => {
      formattedContacts.push({
        id: c._id,
        type: 'company',
        name: `${c.name} (${c.hrName || 'HR'})`,
        email: c.hrEmail,
        subtitle: `${c.industry} • ${c.location || 'Head Office'}`,
        avatar: c.logoUrl
      });
    });

    // Format admins
    admins.forEach((a) => {
      formattedContacts.push({
        id: a._id,
        type: 'admin',
        name: `${a.name} (TPO Admin)`,
        email: a.email,
        subtitle: 'University Placement Office',
        avatar: a.avatar
      });
    });

    res.status(200).json({
      success: true,
      count: formattedContacts.length,
      data: formattedContacts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversation threads for current user
// @route   GET /api/emails/threads
// @access  Private
exports.getThreads = async (req, res, next) => {
  try {
    const userEmail = normalizeEmail(req.user.email);
    const userId = req.user.id || req.user._id;

    // Find all non-draft emails where user is sender or recipient
    const userEmails = await EmailLog.find({
      status: { $ne: 'Draft' },
      $or: [
        { senderId: userId },
        { sentBy: userId },
        { senderEmail: userEmail },
        { recipientId: userId },
        { recipientEmail: userEmail },
        { recipient: userEmail }
      ]
    }).sort({ createdAt: -1 });

    // Group by threadId
    const threadMap = new Map();

    userEmails.forEach((email) => {
      const threadId = email.threadId || `thread_${email._id}`;
      if (!threadMap.has(threadId)) {
        threadMap.set(threadId, {
          threadId,
          subject: email.subject,
          type: email.type || 'Direct Message',
          lastMessageAt: email.createdAt,
          lastMessageBody: email.body,
          lastSenderName: email.senderName || email.sender,
          lastSenderEmail: email.senderEmail,
          participants: [email.senderEmail, email.recipientEmail].filter(Boolean),
          messageCount: 0,
          hasUnread: false,
          latestEmail: email
        });
      }

      const thread = threadMap.get(threadId);
      thread.messageCount += 1;
      if (!email.isRead && normalizeEmail(email.recipientEmail || email.recipient) === userEmail) {
        thread.hasUnread = true;
      }
    });

    const threads = Array.from(threadMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );

    res.status(200).json({
      success: true,
      count: threads.length,
      data: threads
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all messages for a specific conversation thread
// @route   GET /api/emails/threads/:threadId
// @access  Private
exports.getThreadMessages = async (req, res, next) => {
  try {
    const { threadId } = req.params;
    const userEmail = normalizeEmail(req.user.email);

    const messages = await EmailLog.find({
      status: { $ne: 'Draft' },
      $or: [{ threadId }, { _id: threadId.replace('thread_', '') }]
    }).sort({ createdAt: 1 });

    // Auto mark all messages where current user is recipient as read
    await EmailLog.updateMany(
      {
        threadId,
        $or: [{ recipientEmail: userEmail }, { recipient: userEmail }],
        isRead: false
      },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send direct 1-to-1 email or broadcast dispatch
// @route   POST /api/emails/send
// @access  Private (All Authenticated Roles)
exports.sendBroadcastEmail = async (req, res, next) => {
  try {
    const {
      to,
      cc,
      subject,
      message,
      html,
      recipientGroup,
      targetBranch,
      customEmails,
      type,
      category,
      threadId: incomingThreadId,
      inReplyTo,
      attachments = []
    } = req.body;

    if (!subject || (!message && !html)) {
      return res.status(400).json({ success: false, message: 'Subject and message body are required' });
    }

    const sender = req.user;
    const senderEmail = normalizeEmail(sender.email);
    const senderName = sender.name || 'Placement Portal User';
    const senderRole = sender.role || 'student';

    let targetEmails = [];

    // Audience expansion
    if (to) {
      if (Array.isArray(to)) {
        targetEmails = to.map(normalizeEmail).filter(Boolean);
      } else if (typeof to === 'string') {
        targetEmails = to.split(',').map(normalizeEmail).filter(Boolean);
      }
    } else if (recipientGroup === 'Specific Branch' && targetBranch) {
      const students = await Student.find({ branch: { $regex: targetBranch.replace('B.Tech ', ''), $options: 'i' } }).select('email');
      targetEmails = students.map((s) => normalizeEmail(s.email)).filter(Boolean);
    } else if (recipientGroup === 'All Students') {
      const students = await Student.find().select('email');
      targetEmails = students.map((s) => normalizeEmail(s.email)).filter(Boolean);
    } else if (recipientGroup === 'Verified Students Only') {
      const students = await Student.find({ verificationStatus: 'Verified' }).select('email');
      targetEmails = students.map((s) => normalizeEmail(s.email)).filter(Boolean);
    } else if (recipientGroup === 'Recruiters') {
      const recruiters = await User.find({ role: 'company' }).select('email');
      targetEmails = recruiters.map((r) => normalizeEmail(r.email)).filter(Boolean);
    } else if (customEmails) {
      targetEmails = (Array.isArray(customEmails) ? customEmails : customEmails.split(','))
        .map(normalizeEmail)
        .filter(Boolean);
    }

    if (targetEmails.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid recipient email address provided.' });
    }

    // Thread ID generation / resolution
    const threadId = incomingThreadId || `thread_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const emailType = type || category || (targetEmails.length > 1 ? 'Broadcast Notice' : 'Direct Message');
    const emailBody = message || (html ? html.replace(/<[^>]*>?/gm, '') : '');

    // Format rich HTML body
    const emailHtml = html || generateDirectEmailHtml({
      subject,
      message: emailBody,
      senderName,
      senderRole,
      senderOrganization: sender.companyName || (senderRole === 'company' ? 'Corporate Recruiter' : undefined),
      recipientName: targetEmails[0]
    });

    const smtpConfigured = isSmtpConfigured();
    let successCount = 0;
    let failureCount = 0;
    let lastError = null;
    let createdLogs = [];

    for (const recipientEmail of targetEmails) {
      const uniqueMsgId = `<msg_${Date.now()}_${crypto.randomBytes(6).toString('hex')}@placement.edu>`;

      // Lookup recipient user in MongoDB to establish link
      const recipientUser = await User.findOne({ email: recipientEmail });

      let sendResult = { success: false, isSmtpConfigured: false, error: 'SMTP Not Configured' };

      if (smtpConfigured) {
        sendResult = await sendEmail({
          to: recipientEmail,
          cc,
          subject: subject.startsWith('Re:') || subject.startsWith('📢') ? subject : `📢 Placement: ${subject}`,
          html: emailHtml,
          text: emailBody,
          replyTo: senderEmail,
          senderName: `${senderName} via Placement Portal`,
          fromEmail: senderEmail,
          messageId: uniqueMsgId,
          inReplyTo,
          references: inReplyTo ? [inReplyTo] : [],
          threadId,
          attachments
        });
      }

      if (sendResult.success) {
        successCount++;
      } else {
        failureCount++;
        lastError = sendResult.error;
      }

      const logStatus = smtpConfigured
        ? sendResult.success ? 'Sent' : 'Failed'
        : 'SMTP Not Configured';

      const deliveryStatus = sendResult.success ? 'SENT' : 'FAILED';

      const emailLog = await EmailLog.create({
        threadId,
        messageId: sendResult.messageId || uniqueMsgId,
        inReplyTo: inReplyTo || null,
        references: inReplyTo ? [inReplyTo] : [],
        sender: senderName,
        senderName,
        senderEmail,
        senderId: sender.id || sender._id,
        senderRole,
        recipient: recipientEmail,
        recipientName: recipientUser ? recipientUser.name : recipientEmail.split('@')[0],
        recipientEmail,
        recipientId: recipientUser ? recipientUser._id : null,
        recipientRole: recipientUser ? recipientUser.role : 'custom',
        recipientEmails: targetEmails,
        cc: Array.isArray(cc) ? cc : cc ? [cc] : [],
        recipientCount: targetEmails.length,
        subject,
        body: emailBody,
        html: emailHtml,
        direction: 'outbound',
        type: emailType,
        template: 'Direct Communication',
        recipientGroup: recipientGroup || 'Direct',
        attachments,
        successCount: sendResult.success ? 1 : 0,
        failureCount: sendResult.success ? 0 : 1,
        status: logStatus,
        deliveryStatus,
        error: sendResult.error || null,
        errorMessage: sendResult.error || null,
        sentAt: new Date(),
        sentBy: sender.id || sender._id,
        isRead: false
      });

      createdLogs.push(emailLog);

      // Create internal in-app notification if recipient is registered
      if (recipientUser) {
        try {
          await Notification.create({
            recipient: recipientUser._id,
            recipientRole: recipientUser.role,
            title: `New Email from ${senderName}`,
            message: `${subject}: ${emailBody.substring(0, 100)}...`,
            type: 'EMAIL_RECEIVED',
            link: '/mailbox'
          });
        } catch (notifErr) {
          // ignore notification error
        }
      }
    }

    if (req.body.draftId) {
      await EmailLog.deleteOne({ _id: req.body.draftId, status: 'Draft' });
    }

    await logActivity({
      type: 'NOTICE_PUBLISHED',
      title: `Email Dispatched: ${subject}`,
      description: `From ${senderName} (${senderRole}) to ${targetEmails.join(', ')}`,
      actor: senderName,
      actorRole: senderRole,
      targetBranch: targetBranch || 'All',
      relatedId: createdLogs[0]?._id
    });

    res.status(200).json({
      success: true,
      isSmtpConfigured: smtpConfigured,
      message: smtpConfigured
        ? `Email dispatched successfully to ${successCount} recipient(s)!`
        : `Email saved to mailbox database (SMTP is not configured in local .env; configure SMTP_HOST to deliver to real inbox).`,
      threadId,
      data: createdLogs[0]
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Inbound Email Webhook (from SendGrid, Mailgun, Brevo, or RFC webhook)
// @route   POST /api/emails/inbound
// @access  Public (Webhook / Inbound Provider)
exports.handleInboundWebhook = async (req, res, next) => {
  try {
    // Inbound payload can come as JSON or form fields (SendGrid, Mailgun, etc.)
    const body = req.body;

    const fromRaw = body.from || body.sender || body.envelope?.from || body.From || '';
    const toRaw = body.to || body.recipient || body.envelope?.to || body.To || '';
    const subject = body.subject || body.Subject || 'Incoming Email Reply';
    const textBody = body.text || body.body || body['body-plain'] || body.stripped_text || '';
    const htmlBody = body.html || body['body-html'] || body.stripped_html || '';
    const inReplyTo = body['in-reply-to'] || body.inReplyTo || body.headers?.['in-reply-to'] || '';
    const referencesRaw = body.references || body.References || body.headers?.references || body.headers?.['references'] || '';
    const messageId = body['message-id'] || body.messageId || `<inbound_${Date.now()}_${crypto.randomBytes(4).toString('hex')}@placement.edu>`;
    const threadIdHeader = body.headers?.['x-placement-thread-id'] || body['x-placement-thread-id'] || null;

    // Parse email addresses from "Name <email@domain.com>" format
    const extractEmail = (str) => {
      if (!str) return '';
      const match = str.match(/<([^>]+)>/) || str.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
      return match ? match[1].toLowerCase().trim() : str.toLowerCase().trim();
    };

    const extractName = (str) => {
      if (!str) return 'External Recipient';
      const match = str.match(/^"?([^"<]+)"?\s*</);
      return match ? match[1].trim() : str.split('@')[0];
    };

    const senderEmail = extractEmail(fromRaw);
    const senderName = extractName(fromRaw);
    const recipientEmail = extractEmail(toRaw);

    if (!senderEmail || !recipientEmail) {
      return res.status(400).json({ success: false, message: 'Invalid inbound email payload: Missing sender or recipient.' });
    }

    // Lookup sender and recipient in MongoDB
    const [senderUser, recipientUser] = await Promise.all([
      User.findOne({ email: senderEmail }),
      User.findOne({ email: recipientEmail })
    ]);

    // Resolve Thread ID:
    // 1. Try X-Placement-Thread-ID header
    // 2. Try matching inReplyTo to an existing EmailLog messageId
    // 3. Try matching clean subject (removing "Re: ") with recipient/sender pair
    let resolvedThreadId = threadIdHeader;

    if (!resolvedThreadId && inReplyTo) {
      const parentEmail = await EmailLog.findOne({ messageId: inReplyTo });
      if (parentEmail && parentEmail.threadId) {
        resolvedThreadId = parentEmail.threadId;
      }
    }

    if (!resolvedThreadId) {
      const cleanSubject = subject.replace(/^(Re|Fwd):\s*/i, '').trim();
      const existingThreadEmail = await EmailLog.findOne({
        subject: { $regex: new RegExp(cleanSubject, 'i') },
        $or: [
          { senderEmail, recipientEmail },
          { senderEmail: recipientEmail, recipientEmail: senderEmail }
        ]
      }).sort({ createdAt: -1 });

      if (existingThreadEmail && existingThreadEmail.threadId) {
        resolvedThreadId = existingThreadEmail.threadId;
      } else {
        resolvedThreadId = `thread_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      }
    }

    const emailLog = await EmailLog.create({
      threadId: resolvedThreadId,
      messageId,
      inReplyTo: inReplyTo || null,
      references: referencesRaw ? (Array.isArray(referencesRaw) ? referencesRaw : referencesRaw.split(/\s+/)) : (inReplyTo ? [inReplyTo] : []),
      sender: senderName,
      senderName,
      senderEmail,
      senderId: senderUser ? senderUser._id : null,
      senderRole: senderUser ? senderUser.role : 'custom',
      recipient: recipientEmail,
      recipientName: recipientUser ? recipientUser.name : recipientEmail.split('@')[0],
      recipientEmail,
      recipientId: recipientUser ? recipientUser._id : null,
      recipientRole: recipientUser ? recipientUser.role : 'custom',
      subject,
      body: textBody || (htmlBody ? htmlBody.replace(/<[^>]*>?/gm, '') : 'No message body'),
      html: htmlBody,
      direction: 'inbound',
      type: 'Direct Message',
      status: 'Received',
      deliveryStatus: 'RECEIVED',
      sentAt: new Date(),
      receivedAt: new Date(),
      isRead: false
    });

    // Create in-app Notification for recipient
    if (recipientUser) {
      await Notification.create({
        recipient: recipientUser._id,
        recipientRole: recipientUser.role,
        title: `Email reply from ${senderName}`,
        message: `${subject}: ${(textBody || 'New inbound message').substring(0, 100)}...`,
        type: 'EMAIL_RECEIVED',
        link: '/mailbox'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Inbound email received and synchronized into Mailbox successfully!',
      threadId: resolvedThreadId,
      data: emailLog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate Inbound External Email (Development / Testing Tool)
// @route   POST /api/emails/simulate-inbound
// @access  Private
exports.simulateInboundEmail = async (req, res, next) => {
  try {
    const { from, to, subject, message, threadId, inReplyTo } = req.body;

    if (!from || !to || !subject || !message) {
      return res.status(400).json({ success: false, message: 'from, to, subject, and message are required' });
    }

    const senderEmail = normalizeEmail(from);
    const recipientEmail = normalizeEmail(to);

    const [senderUser, recipientUser] = await Promise.all([
      User.findOne({ email: senderEmail }),
      User.findOne({ email: recipientEmail })
    ]);

    const resolvedThreadId = threadId || `thread_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const uniqueMsgId = `<inbound_${Date.now()}_${crypto.randomBytes(4).toString('hex')}@external.mail>`;

    const emailLog = await EmailLog.create({
      threadId: resolvedThreadId,
      messageId: uniqueMsgId,
      inReplyTo: inReplyTo || null,
      references: inReplyTo ? [inReplyTo] : [],
      sender: senderUser ? senderUser.name : senderEmail.split('@')[0],
      senderName: senderUser ? senderUser.name : senderEmail.split('@')[0],
      senderEmail,
      senderId: senderUser ? senderUser._id : null,
      senderRole: senderUser ? senderUser.role : 'custom',
      recipient: recipientEmail,
      recipientName: recipientUser ? recipientUser.name : recipientEmail.split('@')[0],
      recipientEmail,
      recipientId: recipientUser ? recipientUser._id : null,
      recipientRole: recipientUser ? recipientUser.role : 'custom',
      subject,
      body: message,
      html: `<div style="font-family: Arial, sans-serif; padding: 15px;">${message}</div>`,
      direction: 'inbound',
      type: 'Direct Message',
      status: 'Received',
      deliveryStatus: 'RECEIVED',
      sentAt: new Date(),
      receivedAt: new Date(),
      isRead: false
    });

    if (recipientUser) {
      await Notification.create({
        recipient: recipientUser._id,
        recipientRole: recipientUser.role,
        title: `Email reply from ${emailLog.senderName}`,
        message: `${subject}: ${message.substring(0, 100)}...`,
        type: 'EMAIL_RECEIVED',
        link: '/mailbox'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Simulated external email reply received successfully!',
      threadId: resolvedThreadId,
      data: emailLog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get email dispatch history logs (Admin)
// @route   GET /api/emails/logs
// @access  Private (Admin / Company)
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

// @desc    Get drafts for current user
// @route   GET /api/emails/drafts
// @access  Private
exports.getDrafts = async (req, res, next) => {
  try {
    const userEmail = normalizeEmail(req.user.email);
    const userId = req.user.id || req.user._id;
    const drafts = await EmailLog.find({
      status: 'Draft',
      $or: [{ senderId: userId }, { sentBy: userId }, { senderEmail: userEmail }]
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: drafts.length,
      data: drafts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save or update an email draft
// @route   POST /api/emails/drafts
// @access  Private
exports.saveDraft = async (req, res, next) => {
  try {
    const { id, to, cc, subject, message, attachments = [], threadId, inReplyTo, category } = req.body;
    const sender = req.user;
    const senderEmail = normalizeEmail(sender.email);
    const senderName = sender.name || 'Placement Portal User';
    const senderRole = sender.role || 'student';

    let draft = null;
    if (id) {
      draft = await EmailLog.findById(id);
    }

    const payload = {
      threadId: threadId || (draft ? draft.threadId : `thread_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`),
      inReplyTo: inReplyTo || (draft ? draft.inReplyTo : null),
      sender: senderName,
      senderName,
      senderEmail,
      senderId: sender.id || sender._id,
      senderRole,
      recipient: Array.isArray(to) ? to[0] : to || '',
      recipientEmail: Array.isArray(to) ? to[0] : to || '',
      recipientEmails: Array.isArray(to) ? to : to ? [to] : [],
      cc: Array.isArray(cc) ? cc : cc ? [cc] : [],
      subject: subject || '(No Subject)',
      body: message || '',
      type: category || 'Draft',
      status: 'Draft',
      deliveryStatus: 'DRAFT',
      attachments,
      sentBy: sender.id || sender._id
    };

    if (draft && draft.status === 'Draft') {
      Object.assign(draft, payload);
      await draft.save();
    } else {
      draft = await EmailLog.create(payload);
    }

    res.status(200).json({
      success: true,
      message: 'Draft saved successfully.',
      data: draft
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an email draft
// @route   DELETE /api/emails/drafts/:id
// @access  Private
exports.deleteDraft = async (req, res, next) => {
  try {
    const draft = await EmailLog.findOne({
      _id: req.params.id,
      status: 'Draft',
      $or: [{ senderId: req.user.id }, { sentBy: req.user.id }, { senderEmail: normalizeEmail(req.user.email) }]
    });

    if (!draft) {
      return res.status(404).json({ success: false, message: 'Draft not found or unauthorized.' });
    }

    await draft.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Draft discarded successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get SMTP configuration status and email counts
// @route   GET /api/emails/status
// @access  Private
exports.getSmtpStatus = async (req, res, next) => {
  try {
    const isConfigured = isSmtpConfigured();
    const missing = getMissingSmtpConfig();
    const total = await EmailLog.countDocuments({ status: { $ne: 'Draft' } });
    const delivered = await EmailLog.countDocuments({ status: { $in: ['Sent', 'Delivered', 'Received'] } });
    const failed = await EmailLog.countDocuments({ status: { $in: ['Failed', 'SMTP Not Configured', 'Partially Failed'] } });

    res.status(200).json({
      success: true,
      data: {
        isConfigured,
        missingConfig: missing,
        smtpHost: process.env.SMTP_HOST || null,
        smtpPort: process.env.SMTP_PORT || '587',
        smtpUser: process.env.SMTP_USER || null,
        total,
        delivered,
        failed,
        successRate: total > 0 ? Math.round((delivered / total) * 100) : 100
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload an attachment file for email composition
// @route   POST /api/emails/upload-attachment
// @access  Private
exports.uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/email_attachments/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Attachment uploaded successfully.',
      data: {
        filename: req.file.originalname,
        storedFilename: req.file.filename,
        url: fileUrl,
        diskPath: req.file.path,
        size: req.file.size,
        contentType: req.file.mimetype
      }
    });
  } catch (error) {
    next(error);
  }
};
