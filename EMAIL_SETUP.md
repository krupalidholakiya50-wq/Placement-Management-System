# 📧 Placement Management System — Real-World Email Setup Guide

## Company ↔ Student Professional Email Communication Infrastructure

This guide provides comprehensive instructions for configuring, operating, and verifying the **Real-World Email System** in the Placement Management System (PlacementPro).

---

## 🏗️ 1. Architecture Overview

The system provides bidirectional email exchange between **Corporate Recruiters** and **Student Candidates**:

```text
                PLACEMENT MANAGEMENT SYSTEM
                             │
       ┌─────────────────────┴─────────────────────┐
       ▼                                           ▼
Company Recruiter                            Student Candidate
(recruiter@company.com)                      (student@gmail.com)
       │                                           │
       ▼                                           ▼
 Angular Mailbox                             Angular Mailbox
 (Compose/Reply)                             (Compose/Reply)
       │                                           │
       ▼                                           ▼
  Node/Express API ────────────────────────► Nodemailer (SMTP)
  (Thread Resolution)                              │
       │                                           ▼
       │                               Real Email Service Provider
       │                                (Gmail / Brevo / SendGrid / SES)
       │                                           │
       │                             ┌─────────────┴─────────────┐
       │                             ▼                           ▼
       │                      Student Gmail Inbox         Company Gmail Inbox
       │                             │                           │
       │                             └─────────────┬─────────────┘
       │                                           │ External Reply
       │                                           ▼
       │                               Inbound Email Webhook
       │                               (/api/emails/inbound)
       │                                           │
       └────────────────◄──────────────────────────┘
```

---

## 🔐 2. Environment Variables Configuration (`backend/.env`)

Configure the following variables in `backend/.env`. **Never commit credentials to Git or include them in frontend code.**

```env
# =========================================================================
# SMTP & REAL-WORLD EMAIL DISPATCH CONFIGURATION
# =========================================================================

# SMTP Server Host (e.g., smtp.gmail.com, smtp-relay.brevo.com, smtp.sendgrid.net)
SMTP_HOST=smtp.gmail.com

# SMTP Port (587 for TLS/STARTTLS, 465 for SSL)
SMTP_PORT=587

# SMTP Secure Connection (true for port 465, false for port 587)
SMTP_SECURE=false

# SMTP Authenticated Username / Email
SMTP_USER=your-university-placement-office@gmail.com

# SMTP Authenticated Password / App Password / API Key
SMTP_PASS=your-16-character-app-password

# Default Verified Platform Sender Email
FROM_EMAIL=your-university-placement-office@gmail.com

# Display Name for Platform Outbound Emails
FROM_NAME=University Placement Cell

# Optional Inbound Webhook Shared Secret Token (for webhook verification)
INBOUND_WEBHOOK_SECRET=your_secure_random_token_12345
```

---

## ⚙️ 3. Outbound SMTP Provider Setup

### Option A: Gmail / Google Workspace (Recommended for University Setup)
1. Navigate to Google Account: **Security** ➔ Enable **2-Step Verification**.
2. Under **2-Step Verification**, click **App passwords**.
3. Generate an App Password with the app name `Placement Portal`.
4. Set the 16-character password into `SMTP_PASS` in `backend/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-account@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   FROM_EMAIL=your-account@gmail.com
   FROM_NAME=University Placement Cell
   ```

### Option B: Brevo (Formerly Sendinblue - Free 300 emails/day)
1. Register at [brevo.com](https://www.brevo.com/).
2. Go to **Transactional** ➔ **Settings** ➔ **Configuration**.
3. Copy SMTP credentials:
   ```env
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-brevo-login-email
   SMTP_PASS=your-brevo-smtp-key
   FROM_EMAIL=verified-sender@yourdomain.com
   ```

### Option C: SendGrid / Amazon SES / Mailgun / Resend
- **SendGrid**: `SMTP_HOST=smtp.sendgrid.net`, `SMTP_USER=apikey`, `SMTP_PASS=SG.xxx`
- **Amazon SES**: `SMTP_HOST=email-smtp.us-east-1.amazonaws.com`, `SMTP_PORT=587`

---

## 📥 4. Inbound Email Webhook & Reply Synchronization

When a recruiter or student replies to an email **directly from their external email app (Gmail, Apple Mail, Outlook)**, the inbound webhook receives the reply and syncs it into the portal Mailbox.

### Inbound Webhook Endpoint:
```http
POST /api/emails/inbound
Content-Type: application/json or multipart/form-data
```

### Inbound Payload Schema:
```json
{
  "from": "student@gmail.com",
  "to": "recruiter@company.com",
  "subject": "Re: Interview Invitation",
  "text": "Thank you for the update. I confirm my availability for tomorrow at 2:00 PM.",
  "in-reply-to": "<msg_123456@placement.edu>",
  "x-placement-thread-id": "thread_1741234567_abc"
}
```

### Inbound Thread Resolution Hierarchy:
1. **Thread Header Matching**: Matches `X-Placement-Thread-ID` header.
2. **Message ID Matching**: If header is missing, matches `in-reply-to` against existing `EmailLog` message IDs.
3. **Subject & Participant Matching**: If both are missing, matches clean `Re: <subject>` with the sender/recipient pair.
4. **Portal Synchronization**: Saves incoming email with `direction: 'inbound'` and sends an in-app `Notification` to the recipient.

---

## 🧪 5. Testing & Verification Scenarios

### Scenario 1: Company Recruiter ➔ Student Email
1. Log in as a Recruiter (`recruiter@google.com` / `recruiter123`).
2. Navigate to **Mailbox** ➔ Click **Compose Email**.
3. In **Recipient Email**, click **Directory Picker** and select a student (or enter your own test Gmail address).
4. Enter Subject: `Technical Interview Round Invitation`.
5. Enter Message body: `Dear Candidate, you have been shortlisted for the round.`
6. Optional: Click **Attach File** to add a PDF/DOCX (e.g. Job Description).
7. Click **Send Official Email ➔**.
8. **Verification**:
   - Outbound email appears in the portal's **Sent** folder.
   - External student inbox receives the email via SMTP.

---

### Scenario 2: Student Portal ➔ Company Recruiter Email
1. Log in as Student (`student@placement.edu` / `student123`).
2. Navigate to **Mailbox** ➔ Click **Compose Email**.
3. Select recruiter from the directory or enter `recruiter@google.com`.
4. Enter Subject: `Candidate Query regarding JNF Schedule`.
5. Click **Send Official Email ➔**.
6. **Verification**: Recruiter receives email with `Reply-To: student@placement.edu`.

---

### Scenario 3: Replying to a Conversation Thread
1. Open any email in the Mailbox reader or switch to the **Threads** tab.
2. Click **Reply** or **Reply to Thread**.
3. `To`, `Subject (Re: ...)`, and `threadId` are auto-populated.
4. Send response.
5. **Verification**: The new reply is appended to the same conversation thread in chronological order.

---

### Scenario 4: Local Dev Inbound Reply Simulator
1. In the Mailbox top header, click **Test Inbound Reply**.
2. Enter the simulated external sender, recipient, subject, and reply message.
3. Click **Inject Inbound Reply ➔**.
4. **Verification**:
   - The inbound message appears in the recipient's **Inbox** with the `INBOUND` badge.
   - The conversation thread updates in real-time.
   - In-app notification counter increments.

---

## 📎 6. Attachments & Drafts Lifecycle

1. **Attachments**:
   - Maximum size: 10MB per attachment.
   - Supported formats: PDF, DOCX, DOC, Excel (XLS, XLSX), Images (PNG, JPG, JPEG), TXT, ZIP.
   - Stored securely in `backend/uploads/email_attachments/`.
2. **Drafts**:
   - Saved with status `Draft`.
   - Access via the **Drafts** tab.
   - Can be resumed, edited, or discarded at any time.

---

## 🛡️ 7. Security & Identity Safeguards

1. **No Frontend Secrets**: Credentials remain strictly on the backend Node.js environment.
2. **Sender Spoofing Prevention**: Outbound SMTP dispatches use the verified platform mailbox (`FROM_EMAIL`) while setting the authenticated user's real email in the `Reply-To` header.
3. **RBAC Isolation**: Users can only access inbox, sent, and thread records where their email or ID is a verified participant.
