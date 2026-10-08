const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory for PDF resumes
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Campus Track (Placement Management System) API is running successfully',
    timestamp: new Date()
  });
});

// Mount Core API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/invitations', require('./routes/invitationRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/seeder', require('./routes/seederRoutes'));

// Global Error Handler

app.use(errorHandler);

module.exports = app;
