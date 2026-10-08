const express = require('express');
const {
  getInbox,
  getSent,
  getDrafts,
  saveDraft,
  deleteDraft,
  uploadAttachment,
  getUnreadCount,
  getEmailById,
  markEmailAsRead,
  markAllEmailsAsRead,
  getContacts,
  getThreads,
  getThreadMessages,
  getEmailLogs,
  getSmtpStatus,
  sendBroadcastEmail,
  handleInboundWebhook,
  simulateInboundEmail
} = require('../controllers/emailController');
const { protect, authorize } = require('../middleware/authMiddleware');
const uploadEmailAttachment = require('../middleware/emailAttachmentMiddleware');

const router = express.Router();

// Mailbox endpoints (Available to all logged-in roles filtered by identity)
router.get('/inbox', protect, getInbox);
router.get('/sent', protect, getSent);
router.get('/drafts', protect, getDrafts);
router.post('/drafts', protect, saveDraft);
router.delete('/drafts/:id', protect, deleteDraft);
router.post('/upload-attachment', protect, uploadEmailAttachment.single('file'), uploadAttachment);

router.get('/unread-count', protect, getUnreadCount);
router.patch('/mark-all-read', protect, markAllEmailsAsRead);
router.get('/contacts', protect, getContacts);
router.get('/threads', protect, getThreads);
router.get('/threads/:threadId', protect, getThreadMessages);
router.get('/status', protect, getSmtpStatus);
router.get('/logs', protect, authorize('admin', 'company'), getEmailLogs);

// Send Email - available to student, company, and admin roles
router.post('/send', protect, sendBroadcastEmail);

// Dev Testing tool for inbound reply simulation
router.post('/simulate-inbound', protect, simulateInboundEmail);

// Public Inbound Email Webhook (SendGrid, Mailgun, Brevo, Resend, or standard webhook)
router.post('/inbound', handleInboundWebhook);

router.get('/:id', protect, getEmailById);
router.patch('/:id/read', protect, markEmailAsRead);

module.exports = router;
