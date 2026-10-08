const nodemailer = require('nodemailer');
const path = require('path');
const dotenv = require('dotenv');

// Ensure .env is reliably loaded from backend directory or cwd
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), 'backend/.env') });

/**
 * Validates if SMTP environment variables are configured
 */
const isSmtpConfigured = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  return !!(host && user && pass);
};

/**
 * Returns list of missing required SMTP environment variable names
 */
const getMissingSmtpConfig = () => {
  const missing = [];
  if (!process.env.SMTP_HOST) missing.push('SMTP_HOST');
  if (!process.env.SMTP_USER) missing.push('SMTP_USER');
  if (!process.env.SMTP_PASS && !process.env.SMTP_PASSWORD) missing.push('SMTP_PASS');
  return missing;
};

/**
 * Creates Nodemailer Transporter using real SMTP settings
 */
const createTransporter = () => {
  if (!isSmtpConfigured()) {
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Diagnostic helper: Verifies connection to configured SMTP provider
 */
const verifySmtpConnection = async () => {
  const missing = getMissingSmtpConfig();
  if (missing.length > 0) {
    return {
      success: false,
      configured: false,
      missing,
      error: 'SMTP credentials/provider configuration is missing.'
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return {
      success: false,
      configured: false,
      missing: ['Transporter Init Failed'],
      error: 'Failed to initialize Nodemailer transporter.'
    };
  }

  try {
    await transporter.verify();
    return {
      success: true,
      configured: true,
      verified: true,
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || '587',
      user: process.env.SMTP_USER
    };
  } catch (error) {
    // Safe error logging (NEVER log passwords or API keys)
    console.error('[SMTP VERIFY ERROR]', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || '587',
      user: process.env.SMTP_USER,
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });

    return {
      success: false,
      configured: true,
      verified: false,
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    };
  }
};

/**
 * Sends an email using real Nodemailer SMTP with full threading & identity support
 */
const sendEmail = async ({
  to,
  cc,
  subject,
  html,
  text,
  replyTo,
  senderName,
  fromEmail,
  messageId,
  inReplyTo,
  references,
  threadId,
  attachments = []
}) => {
  try {
    if (!isSmtpConfigured()) {
      const missing = getMissingSmtpConfig();
      return {
        success: false,
        error: `SMTP credentials/provider configuration is missing: ${missing.join(', ')}`,
        missingConfig: missing,
        isSmtpConfigured: false,
        recipient: to
      };
    }

    const transporter = createTransporter();
    if (!transporter) {
      return {
        success: false,
        error: 'SMTP configuration required. Transporter failed to initialize.',
        isSmtpConfigured: false,
        recipient: to
      };
    }

    // Default sending identity: verified platform address with dynamic display name
    const verifiedFrom = process.env.FROM_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
    const displayName = senderName || process.env.FROM_NAME || 'University Placement Cell';
    const fromAddress = `"${displayName}" <${verifiedFrom}>`;

    // Ensure Reply-To is set to the actual sender's email so recipient replies reach them
    const replyToAddress = replyTo || fromEmail || verifiedFrom;

    const mailOptions = {
      from: fromAddress,
      to,
      replyTo: replyToAddress,
      subject,
      text: text || (html ? html.replace(/<[^>]*>?/gm, '') : ''),
      html
    };

    if (cc && (Array.isArray(cc) ? cc.length > 0 : cc)) {
      mailOptions.cc = cc;
    }

    if (messageId) {
      mailOptions.messageId = messageId;
    }

    if (inReplyTo) {
      mailOptions.inReplyTo = inReplyTo;
    }

    if (references) {
      mailOptions.references = Array.isArray(references) ? references.join(' ') : references;
    }

    // Custom tracking headers for conversation matching
    const headers = {};
    if (threadId) {
      headers['X-Placement-Thread-ID'] = threadId;
    }
    if (replyToAddress) {
      headers['X-Sender-Real-Email'] = replyToAddress;
    }
    mailOptions.headers = headers;

    // Attachments support
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments.map((att) => ({
        filename: att.filename,
        content: att.content || undefined,
        path: att.diskPath || att.path || att.url || undefined,
        contentType: att.contentType
      }));
    }

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      providerMessageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      recipient: to,
      isSmtpConfigured: true
    };
  } catch (error) {
    // Safe error logging (NEVER print passwords)
    console.error('[EMAIL SEND ERROR]', {
      recipient: to,
      subject,
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });

    return {
      success: false,
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      recipient: to,
      isSmtpConfigured: true
    };
  }
};

/**
 * Formats HTML Template for Direct Placement Communications (Company <-> Student)
 */
const generateDirectEmailHtml = ({
  subject,
  message,
  senderName,
  senderRole,
  senderOrganization,
  recipientName,
  replyInstructions
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: #1e293b; padding: 24px 30px; text-align: left; color: #ffffff; border-bottom: 3px solid #2563eb; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
        .header p { margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; font-family: monospace; text-transform: uppercase; }
        .content { padding: 30px; }
        .sender-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 22px; font-size: 13px; }
        .sender-card strong { color: #0f172a; }
        .message-body { font-size: 14px; line-height: 1.7; color: #334155; white-space: pre-line; background: #ffffff; border-left: 4px solid #2563eb; padding: 12px 18px; margin-bottom: 24px; }
        .reply-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 18px; font-size: 12px; color: #1e40af; margin-bottom: 20px; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 11px 22px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 13px; }
        .footer { background: #f8fafc; padding: 18px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 University Placement System</h1>
          <p>OFFICIAL CAMPUS RECRUITMENT COMMUNICATION</p>
        </div>
        <div class="content">
          <div class="sender-card">
            <div><strong>From:</strong> ${senderName} (${senderRole === 'company' ? (senderOrganization || 'Corporate Recruiter') : senderRole === 'student' ? 'Student Candidate' : 'Placement Administrator'})</div>
            <div><strong>Subject:</strong> ${subject}</div>
          </div>

          <div class="message-body">${message}</div>

          <div class="reply-box">
            💡 <strong>How to Reply:</strong> You can click <strong>Reply</strong> in your email client to respond directly, or log in to the <a href="http://localhost:4200/mailbox" style="color: #1e40af; font-weight: bold;">Placement Portal Mailbox</a> to view the full conversation thread.
          </div>

          <div style="text-align: center; margin-top: 25px;">
            <a href="http://localhost:4200/mailbox" class="btn">Open Portal Mailbox ➔</a>
          </div>
        </div>
        <div class="footer">
          Training & Placement Cell • University Campus • 2026 Batch<br>
          Dispatched securely via the Placement Management System.
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Formats HTML Template for Placement Notices
 */
const generateNoticeHtml = ({ noticeTitle, noticeContent, companyName, role, packageOffered, eligibilityCriteria }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #090d16 0%, #1e1b4b 100%); padding: 30px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 5px 0 0 0; color: #38bdf8; font-size: 12px; font-family: monospace; text-transform: uppercase; font-weight: 700; }
        .content { padding: 30px; }
        .badge { display: inline-block; background: #eff6ff; color: #4f46e5; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; font-family: monospace; margin-bottom: 15px; }
        .notice-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 15px; line-height: 1.4; }
        .notice-body { font-size: 14px; line-height: 1.7; color: #334155; white-space: pre-line; background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #4f46e5; margin-bottom: 20px; }
        .details-grid { width: 100%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 25px; box-sizing: border-box; }
        .detail-item { font-size: 13px; padding: 6px 0; color: #475569; }
        .detail-item strong { color: #0f172a; }
        .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; text-align: center; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 University Placement Cell</h1>
          <p>OFFICIAL RECRUITMENT NOTICE BROADCAST</p>
        </div>
        <div class="content">
          <span class="badge">OFFICIAL TPO NOTIFICATION</span>
          <h2 class="notice-title">${noticeTitle}</h2>
          
          <div class="notice-body">${noticeContent}</div>

          <div class="details-grid">
            <div class="detail-item"><strong>Company / Organizer:</strong> ${companyName || 'University T&P Cell'}</div>
            ${role ? `<div class="detail-item"><strong>Designation / Role:</strong> ${role}</div>` : ''}
            ${packageOffered ? `<div class="detail-item"><strong>CTC Package:</strong> ${packageOffered}</div>` : ''}
            ${eligibilityCriteria ? `<div class="detail-item"><strong>Eligibility:</strong> ${eligibilityCriteria}</div>` : ''}
          </div>

          <div style="text-align: center;">
            <a href="http://localhost:4200/notices" class="btn">View Notice Board on Portal ➔</a>
          </div>
        </div>
        <div class="footer">
          Training & Placement Cell • University Campus • 2026 Batch<br>
          This is an official communication dispatched from the Campus Placement Management System.
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendEmail,
  generateDirectEmailHtml,
  generateNoticeHtml,
  isSmtpConfigured,
  verifySmtpConnection,
  getMissingSmtpConfig
};

