const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: [true, 'Company Name is required'],
      unique: true,
      trim: true
    },
    logoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=120&q=80'
    },
    industry: {
      type: String,
      required: [true, 'Industry Sector is required'],
      default: 'Product Development'
    },
    website: {
      type: String,
      required: [true, 'Official website is required']
    },
    hrName: {
      type: String,
      default: 'Recruitment HR'
    },
    hrEmail: {
      type: String,
      required: [true, 'HR Contact Email is required']
    },
    hrPhone: {
      type: String,
      default: '+91 9876543210'
    },
    contactPerson: {
      type: String
    },
    contactEmail: {
      type: String
    },
    headOffice: {
      type: String,
      default: 'Bangalore, Karnataka'
    },
    location: {
      type: String,
      default: 'Bangalore, Karnataka'
    },
    description: {
      type: String,
      required: [true, 'Company Overview is required']
    },
    linkedinUrl: {
      type: String,
      default: 'https://linkedin.com/company/tech-partner'
    },
    employeeCount: {
      type: String,
      default: '1,000 - 5,000 Employees'
    },
    hiringDomains: {
      type: [String],
      default: ['Software Engineering', 'Full Stack Development', 'Data Science', 'Cloud & DevOps']
    },
    campusHistory: {
      type: [String],
      default: ['2023 Hiring: 14 Placed', '2024 Hiring: 18 Placed', '2025 Hiring: 24 Placed']
    },
    isApprovedByAdmin: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['Active', 'Pending Approval', 'Suspended'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Company', CompanySchema);
