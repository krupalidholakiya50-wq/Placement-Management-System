const nodemailer = require('nodemailer');

/**
 * Creates Nodemailer Transporter
 */
const createTransporter = async () => {
  // If SMTP environment variables are specified, use production SMTP server (e.g. Gmail / Mailtrap / SendGrid)
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback: Create Ethereal / Test Transporter for instant zero-config testing
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

/**
 * Sends a single email using Nodemailer
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = await createTransporter();

    const fromAddress = process.env.FROM_EMAIL
      ? `"${process.env.FROM_NAME || 'University Placement Cell'}" <${process.env.FROM_EMAIL}>`
      : '"University Placement Cell" <tnp@university.edu>';

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html
    });

    console.log(`✉️ Email dispatched to [${to}] | MessageID: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 Email Preview Link: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      recipient: to
    };
  } catch (error) {
    console.error(`❌ Nodemailer Error sending email to ${to}:`, error.message);
    return {
      success: false,
      error: error.message,
      recipient: to
    };
  }
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
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 5px 0 0 0; color: #38bdf8; font-size: 12px; font-family: monospace; text-transform: uppercase; font-weight: 700; }
        .content { padding: 30px; }
        .badge { display: inline-block; background: #eff6ff; color: #2563eb; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; font-family: monospace; margin-bottom: 15px; }
        .notice-title { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 15px; line-height: 1.4; }
        .notice-body { font-size: 14px; line-height: 1.7; color: #334155; white-space: pre-line; background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #2563eb; margin-bottom: 20px; }
        .details-grid { display: table; width: 100%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin-bottom: 25px; }
        .detail-item { font-size: 13px; padding: 6px 0; color: #475569; }
        .detail-item strong { color: #0f172a; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 24px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 14px; text-align: center; }
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
          This is an automated email broadcast sent to your registered student address.
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendEmail,
  generateNoticeHtml
};
