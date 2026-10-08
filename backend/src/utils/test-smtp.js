const path = require('path');
const dotenv = require('dotenv');

// Load environment configuration
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), 'backend/.env') });

const { isSmtpConfigured, verifySmtpConnection, sendEmail } = require('./sendEmail');

async function runDiagnostics() {
  console.log('=== REAL-WORLD SMTP DIAGNOSTIC SUITE ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Node Version:', process.version);
  console.log('Working Directory:', process.cwd());
  
  // Safe environment inspection (NEVER print passwords)
  const envStatus = {
    SMTP_HOST: process.env.SMTP_HOST || '[MISSING/NOT_SET]',
    SMTP_PORT: process.env.SMTP_PORT || '[DEFAULT: 587]',
    SMTP_SECURE: process.env.SMTP_SECURE || '[DEFAULT: false]',
    SMTP_USER: process.env.SMTP_USER || '[MISSING/NOT_SET]',
    SMTP_PASS_CONFIGURED: !!(process.env.SMTP_PASS || process.env.SMTP_PASSWORD),
    FROM_EMAIL: process.env.FROM_EMAIL || '[NOT_SET]'
  };

  console.log('\n[ENVIRONMENT CONFIGURATION STATUS]');
  console.table(envStatus);

  console.log('\n[SMTP CONFIGURATION CHECK]');
  const configured = isSmtpConfigured();
  console.log('isSmtpConfigured():', configured);

  console.log('\n[TRANSPORTER VERIFICATION CHECK]');
  const verifyResult = await verifySmtpConnection();
  console.log('Transporter Verify Result:', JSON.stringify(verifyResult, null, 2));

  if (configured && verifyResult.success) {
    console.log('\n[TEST EMAIL SEND ATTEMPT]');
    const sendResult = await sendEmail({
      to: process.env.TEST_RECIPIENT || process.env.SMTP_USER,
      subject: 'REAL EMAIL TEST — PlacementPro',
      text: 'This is a real outbound email test from the Placement Management System.',
      senderName: 'University Placement Cell'
    });
    console.log('sendMail() Result:', JSON.stringify(sendResult, null, 2));
  } else {
    console.log('\n[SMTP NOT READY]');
    console.log('Reason: SMTP credentials/provider configuration is missing or invalid.');
  }

  console.log('\n=== DIAGNOSTIC SUITE COMPLETE ===');
}

runDiagnostics().catch(console.error);
