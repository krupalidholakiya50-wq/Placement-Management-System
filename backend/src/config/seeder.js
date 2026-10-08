const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const EmailLog = require('../models/EmailLog');


const seedData = async () => {
  try {
    // Drop legacy indexes if present
    try {
      await Student.collection.dropIndexes();
    } catch (e) {
      // ignore index drop error if collection new
    }

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('🌱 Database already contains records. Skipping auto-seeding.');
      return;
    }

    console.log('🌱 Database empty. Seeding initial production data...');

    // 1. Create Default Users (Admin, Student, Company HR)
    const adminUser = await User.create({
      name: 'TPO Director (Admin)',
      email: 'admin@placement.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 9998887770',
      department: 'Placement Cell'
    });

    const studentUser = await User.create({
      name: 'Alex Johnson',
      email: 'student@placement.com',
      password: 'student123',
      role: 'student',
      phone: '+91 9876543210',
      department: 'Computer Science'
    });

    const companyUser = await User.create({
      name: 'Tech HR Recruiter',
      email: 'company@placement.com',
      password: 'company123',
      role: 'company',
      phone: '+91 9123456789',
      department: 'Talent Acquisition'
    });

    // 2. Create Companies
    const companies = await Company.insertMany([
      {
        name: 'Google India',
        logoUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=150&q=80',
        hrName: 'Sarah Jenkins',
        email: 'careers-india@google.com',
        phone: '+91 80 1234 5678',
        website: 'https://careers.google.com',
        address: 'Google Signature Towers, Outer Ring Road, Bangalore',
        packageOffered: '28.5 LPA',
        eligibleBranches: ['B.Tech CSE', 'B.Tech IT'],
        minCgpa: 8.5,
        hiringStatus: 'Active'
      },
      {
        name: 'Microsoft IDC',
        logoUrl: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&w=150&q=80',
        hrName: 'David Miller',
        email: 'recruitment@microsoft.com',
        phone: '+91 40 8877 6655',
        website: 'https://careers.microsoft.com',
        address: 'Gachibowli Tech Campus, Hyderabad',
        packageOffered: '24.0 LPA',
        eligibleBranches: ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE'],
        minCgpa: 8.0,
        hiringStatus: 'Active'
      },
      {
        name: 'Amazon Web Services',
        logoUrl: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=150&q=80',
        hrName: 'Priya Sharma',
        email: 'aws-hiring@amazon.com',
        phone: '+91 80 9988 1122',
        website: 'https://amazon.jobs',
        address: 'Constellation Business Park, Bangalore',
        packageOffered: '18.5 LPA',
        eligibleBranches: ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE', 'B.Tech ME'],
        minCgpa: 7.5,
        hiringStatus: 'Active'
      },
      {
        name: 'TCS Digital',
        logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&q=80',
        hrName: 'Rajesh Kumar',
        email: 'campus@tcs.com',
        phone: '+91 22 4455 6677',
        website: 'https://nextstep.tcs.com',
        address: 'TCS Olympus, Thane West, Mumbai',
        packageOffered: '7.5 LPA',
        eligibleBranches: ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE', 'B.Tech ME', 'B.Tech Civil'],
        minCgpa: 6.5,
        hiringStatus: 'Active'
      }
    ]);

    // 3. Create Students
    const students = await Student.insertMany([
      {
        user: studentUser._id,
        studentId: 'STU2026001',
        registerNumber: 'REG2026001',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        fullName: 'Alex Johnson',
        email: 'student@placement.com',
        phone: '+91 9876543210',
        gender: 'Male',
        department: 'Computer Science',
        branch: 'B.Tech CSE',
        year: '4th Year',
        cgpa: 9.1,
        skills: ['Angular 20', 'TypeScript', 'Node.js', 'Express', 'MongoDB'],
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        placementStatus: 'Placed',
        placedCompany: 'Google India',
        package: '28.5 LPA'
      },
      {
        studentId: 'STU2026002',
        registerNumber: 'REG2026002',
        photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        fullName: 'Emily Watson',
        email: 'emily.watson@student.edu',
        phone: '+91 9876543211',
        gender: 'Female',
        department: 'Information Technology',
        branch: 'B.Tech IT',
        year: '4th Year',
        cgpa: 8.8,
        skills: ['React', 'Node.js', 'Python', 'PostgreSQL', 'Docker'],
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        placementStatus: 'Placed',
        placedCompany: 'Microsoft IDC',
        package: '24.0 LPA'
      },
      {
        studentId: 'STU2026003',
        registerNumber: 'REG2026003',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        fullName: 'Rohan Mehta',
        email: 'rohan.mehta@student.edu',
        phone: '+91 9876543212',
        gender: 'Male',
        department: 'Electronics',
        branch: 'B.Tech ECE',
        year: '4th Year',
        cgpa: 7.9,
        skills: ['Embedded C', 'Python', 'IoT', 'VLSI', 'Linux'],
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        placementStatus: 'Unplaced'
      },
      {
        studentId: 'STU2026004',
        registerNumber: 'REG2026004',
        photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
        fullName: 'Sophia Davis',
        email: 'sophia.davis@student.edu',
        phone: '+91 9876543213',
        gender: 'Female',
        department: 'Mechanical',
        branch: 'B.Tech ME',
        year: '4th Year',
        cgpa: 8.2,
        skills: ['AutoCAD', 'SolidWorks', 'ANSYS', 'Python'],
        resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        placementStatus: 'Unplaced'
      }
    ]);

    // 4. Create Jobs
    const jobs = await Job.insertMany([
      {
        title: 'Full Stack Software Engineer',
        company: companies[0]._id,
        companyName: 'Google India',
        companyLogo: companies[0].logoUrl,
        description: 'Architect, design, and implement high-performance cloud applications using modern microservices, Angular standalone components, and scalable backend platforms.',
        eligibility: 'CGPA >= 8.5, No active backlogs, strong fundamentals in DSA & OS',
        salary: '28.5 LPA',
        location: 'Bangalore / Hybrid',
        jobType: 'Full Time',
        eligibleBranches: ['B.Tech CSE', 'B.Tech IT'],
        minCgpa: 8.5,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'Active',
        postedBy: adminUser._id
      },
      {
        title: 'Cloud Solutions Architect',
        company: companies[1]._id,
        companyName: 'Microsoft IDC',
        companyLogo: companies[1].logoUrl,
        description: 'Build mission-critical Azure cloud infrastructure services. Work directly with global enterprise engineering teams.',
        eligibility: 'CGPA >= 8.0, proficiency in C++, C# or TypeScript, System Design basics',
        salary: '24.0 LPA',
        location: 'Hyderabad',
        jobType: 'Full Time',
        eligibleBranches: ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE'],
        minCgpa: 8.0,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'Active',
        postedBy: adminUser._id
      },
      {
        title: 'DevOps & Backend Engineer Intern',
        company: companies[2]._id,
        companyName: 'Amazon Web Services',
        companyLogo: companies[2].logoUrl,
        description: 'Develop automated CI/CD pipelines, container orchestration, and serverless APIs on AWS cloud platform.',
        eligibility: 'CGPA >= 7.5, Linux shell scripting, Docker, Node.js or Python experience',
        salary: '18.5 LPA',
        location: 'Bangalore / Remote',
        jobType: 'Internship + Full Time',
        eligibleBranches: ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE'],
        minCgpa: 7.5,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'Active',
        postedBy: adminUser._id
      }
    ]);

    // 5. Create Applications
    await Application.insertMany([
      {
        job: jobs[0]._id,
        student: students[0]._id,
        studentUser: studentUser._id,
        studentName: students[0].fullName,
        studentEmail: students[0].email,
        department: students[0].department,
        branch: students[0].branch,
        year: students[0].year,
        cgpa: students[0].cgpa,
        status: 'Selected',
        statusTimeline: [
          { status: 'Applied', updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), note: 'Application submitted successfully.' },
          { status: 'Shortlisted', updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), note: 'Shortlisted based on high CGPA & technical test.' },
          { status: 'Interview Scheduled', updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), note: 'System Design and Coding Round.' },
          { status: 'Selected', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Offer letter issued for 28.5 LPA!' }
        ]
      },
      {
        job: jobs[1]._id,
        student: students[1]._id,
        studentName: students[1].fullName,
        studentEmail: students[1].email,
        department: students[1].department,
        branch: students[1].branch,
        year: students[1].year,
        cgpa: students[1].cgpa,
        status: 'Selected',
        statusTimeline: [
          { status: 'Applied', updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), note: 'Applied for Microsoft IDC drive.' },
          { status: 'Shortlisted', updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), note: 'Shortlisted for technical interview.' },
          { status: 'Selected', updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Offer accepted.' }
        ]
      },
      {
        job: jobs[2]._id,
        student: students[2]._id,
        studentName: students[2].fullName,
        studentEmail: students[2].email,
        department: students[2].department,
        branch: students[2].branch,
        year: students[2].year,
        cgpa: students[2].cgpa,
        status: 'Interview Scheduled',
        statusTimeline: [
          { status: 'Applied', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Application registered.' },
          { status: 'Interview Scheduled', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Technical interview set for tomorrow 10:00 AM.' }
        ]
      }
    ]);

    // 6. Create Default Notices & Email Broadcasts
    await Notice.insertMany([
      {
        title: '📢 Urgent: Google India Technical Interview Schedule Released',
        category: 'Interview Schedule',
        companyName: 'Google India',
        role: 'Full Stack Software Engineer',
        packageOffered: '28.5 LPA',
        eligibilityCriteria: 'Shortlisted CSE & IT Students (CGPA >= 8.5)',
        targetBranch: 'B.Tech CSE, IT',
        priority: 'Urgent',
        content: 'Dear Candidates, The technical interview rounds for Google India Software Engineer drive are scheduled for tomorrow starting 09:30 AM in Lab 302. Please ensure your college ID and updated resume are ready. Meeting links have also been dispatched to your registered email IDs.',
        isEmailSent: true,
        postedBy: adminUser._id,
        alertLogs: [
          { channel: 'Student Portal Dashboard', recipientCount: 45, status: 'Published' },
          { channel: 'SMTP Email Broadcast', recipientCount: 45, status: 'Delivered' }
        ]
      },
      {
        title: '🚀 Microsoft IDC Campus Recruitment Drive Announcement',
        category: 'Campus Drive',
        companyName: 'Microsoft IDC',
        role: 'Cloud Solutions Architect',
        packageOffered: '24.0 LPA',
        eligibilityCriteria: 'CGPA >= 8.0 across CSE, IT & ECE',
        targetBranch: 'All Branches',
        priority: 'High',
        content: 'Microsoft IDC has published a new campus placement drive for Cloud Solutions Architect position (24.0 LPA). Last date to submit applications on the portal is September 15. Make sure your profile & documents are verified by TPO Cell.',
        isEmailSent: true,
        postedBy: adminUser._id,
        alertLogs: [
          { channel: 'Student Portal Dashboard', recipientCount: 380, status: 'Published' },
          { channel: 'SMTP Email Broadcast', recipientCount: 380, status: 'Delivered' }
        ]
      },
      {
        title: '📋 TPO Mandatory Resume & Document Verification Deadline',
        category: 'General Notice',
        companyName: 'University T&P Cell',
        role: 'All Batch 2026 Students',
        packageOffered: 'N/A',
        eligibilityCriteria: 'All 4th Year B.Tech Students',
        targetBranch: 'All Branches',
        priority: 'Normal',
        content: 'All 2026 batch unplaced students are required to upload their latest PDF resumes and transcript files on the portal before Friday 5:00 PM to maintain eligibility for upcoming Tier-1 recruiter drives.',
        isEmailSent: true,
        postedBy: adminUser._id,
        alertLogs: [
          { channel: 'Student Portal Dashboard', recipientCount: 450, status: 'Published' },
          { channel: 'SMTP Email Broadcast', recipientCount: 450, status: 'Delivered' }
        ]
      }
    ]);
    
    const now = Date.now();

    // 7. Seed 15 Realistic Notification Records Per Role (Admin, Student, Company)
    const studentNotifications = [
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'Placement Drive Published: Google India',
        message: 'Google India announced Full Stack Software Engineer (28.5 LPA). Eligible CSE/IT candidates can register.',
        type: 'DRIVE_ANNOUNCEMENT',
        link: '/jobs',
        isRead: false,
        createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'Application Submitted: Google India',
        message: 'Your application for Full Stack Software Engineer has been registered successfully.',
        type: 'APPLICATION_UPDATE',
        link: '/applications',
        isRead: true,
        readAt: new Date(now - 9 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 9 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'Application Under Review',
        message: 'Google India Recruitment Panel has verified your CGPA (9.1) and shortlisted your profile for testing.',
        type: 'APPLICATION_UPDATE',
        link: '/applications',
        isRead: true,
        readAt: new Date(now - 8 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'Online Assessment Assigned',
        message: 'Online Technical Assessment: Google Coding Challenge (60 mins) has been assigned. Window opens today.',
        type: 'ASSESSMENT_INVITATION',
        link: '/assessments',
        isRead: false,
        createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'Online Assessment Reminder',
        message: 'Reminder: Google India Technical Assessment window closes in 24 hours. Ensure timely completion.',
        type: 'ASSESSMENT_INVITATION',
        link: '/assessments',
        isRead: true,
        readAt: new Date(now - 6 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'Assessment Submitted Successfully',
        message: 'Your assessment submission was received. Score: 92/100 (Qualified).',
        type: 'ASSESSMENT_RESULT',
        link: '/assessments',
        isRead: true,
        readAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'Assessment Result Published',
        message: 'Congratulations! You have cleared Round 1 Online Assessment for Google India.',
        type: 'ASSESSMENT_RESULT',
        link: '/assessments',
        isRead: false,
        createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'Candidate Shortlisted for Interview',
        message: 'You have been shortlisted for Round 2 Technical Interview with Google India Engineering team.',
        type: 'APPLICATION_UPDATE',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'Technical Interview Scheduled',
        message: 'Technical Interview Round 1 scheduled for Friday at 10:00 AM via Google Meet.',
        type: 'INTERVIEW_SCHEDULED',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'Technical Round Cleared',
        message: 'Feedback updated: Candidate successfully cleared System Design & Data Structures round.',
        type: 'INTERVIEW_SCHEDULED',
        link: '/applications',
        isRead: true,
        readAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'HR Interview Scheduled',
        message: 'Final HR Discussion scheduled for tomorrow at 3:00 PM with Google Talent Acquisition.',
        type: 'INTERVIEW_SCHEDULED',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'Final Selection Announced',
        message: 'Congratulations! You have been selected for the position of Full Stack Software Engineer at Google India.',
        type: 'OFFER_EXTENDED',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'Offer Letter Available',
        message: 'Official Offer Letter with CTC 28.5 LPA is available for download on the portal.',
        type: 'OFFER_EXTENDED',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 18 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'TPO Mandatory Notice',
        message: 'All Batch 2026 students are required to verify resume documents with T&P Cell.',
        type: 'SYSTEM_ALERT',
        link: '/notices',
        isRead: true,
        readAt: new Date(now - 12 * 60 * 60 * 1000),
        createdAt: new Date(now - 12 * 60 * 60 * 1000)
      },
      {
        recipient: studentUser._id,
        recipientRole: 'student',
        title: 'Upcoming Drive: Microsoft IDC',
        message: 'Microsoft IDC Cloud Solutions Architect drive (24.0 LPA) registration closes in 3 days.',
        type: 'DRIVE_ANNOUNCEMENT',
        link: '/jobs',
        isRead: false,
        createdAt: new Date(now - 4 * 60 * 60 * 1000)
      }
    ];

    const recruiterNotifications = [
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'Company Registration Approved',
        message: 'Your corporate partner profile has been approved by the University Training & Placement Office.',
        type: 'COMPANY_APPROVAL',
        link: '/companies',
        isRead: true,
        readAt: new Date(now - 12 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 12 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'Placement Drive Published',
        message: 'Full Stack Software Engineer drive is now active. Batch eligibility metrics calculated.',
        type: 'DRIVE_ANNOUNCEMENT',
        link: '/jobs',
        isRead: true,
        readAt: new Date(now - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'New Applications Received',
        message: '45 candidate applications received for Full Stack Software Engineer position.',
        type: 'APPLICATION_UPDATE',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 9 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'Candidate Eligibility Verified',
        message: 'TPO Cell verified 38 eligible candidates matching CGPA >= 8.5 criteria.',
        type: 'STUDENT_VERIFICATION',
        link: '/applications',
        isRead: true,
        readAt: new Date(now - 8 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'Assessment Published & Assigned',
        message: 'Technical Coding Assessment published and assigned to 35 eligible candidates.',
        type: 'ASSESSMENT_INVITATION',
        link: '/assessments',
        isRead: true,
        readAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'Assessment Submissions Received',
        message: '32 candidates completed the online assessment. Performance analytics ready for review.',
        type: 'ASSESSMENT_RESULT',
        link: '/assessments',
        isRead: false,
        createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'Candidates Shortlisted',
        message: '12 candidates scored >80% and were advanced to Technical Interview stage.',
        type: 'APPLICATION_UPDATE',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'Interview Slots Scheduled',
        message: 'Technical Interview panel slots configured for Friday starting at 09:30 AM.',
        type: 'INTERVIEW_SCHEDULED',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'Interview Panel Feedback Logged',
        message: 'Technical panel submitted evaluation feedback for 10 candidates.',
        type: 'INTERVIEW_SCHEDULED',
        link: '/applications',
        isRead: true,
        readAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'Candidate Selection Confirmed',
        message: 'Final selection confirmed for candidate Alex Johnson (CGPA 9.1).',
        type: 'OFFER_EXTENDED',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'Offer Letter Drafted',
        message: 'Offer letter for 28.5 LPA generated and dispatched for student acceptance.',
        type: 'OFFER_EXTENDED',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 20 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'Offer Accepted by Candidate',
        message: 'Alex Johnson has formally accepted the campus placement offer from Google India.',
        type: 'OFFER_EXTENDED',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 16 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'TPO Onboarding Request',
        message: 'Placement cell requested confirmation of tentative joining date for selected candidates.',
        type: 'SYSTEM_ALERT',
        link: '/mailbox',
        isRead: false,
        createdAt: new Date(now - 10 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'Drive Application Deadline',
        message: 'Application deadline for Full Stack Software Engineer drive reached.',
        type: 'DRIVE_ANNOUNCEMENT',
        link: '/jobs',
        isRead: true,
        readAt: new Date(now - 5 * 60 * 60 * 1000),
        createdAt: new Date(now - 5 * 60 * 60 * 1000)
      },
      {
        recipient: companyUser._id,
        recipientRole: 'company',
        title: 'Campus Recruitment Summary',
        message: 'Drive completion report and placement statistics generated for academic record.',
        type: 'SYSTEM_ALERT',
        link: '/reports',
        isRead: false,
        createdAt: new Date(now - 1 * 60 * 60 * 1000)
      }
    ];

    const adminNotifications = [
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'New Corporate Registration',
        message: 'Google India registered corporate recruiting profile on the portal.',
        type: 'COMPANY_APPROVAL',
        link: '/companies',
        isRead: true,
        readAt: new Date(now - 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'Company Verification Pending',
        message: 'Microsoft IDC submitted campus recruiting credentials for TPO verification.',
        type: 'COMPANY_APPROVAL',
        link: '/companies',
        isRead: false,
        createdAt: new Date(now - 12 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'New Placement Drive Created',
        message: 'Google India published Full Stack Software Engineer drive offering 28.5 LPA.',
        type: 'DRIVE_ANNOUNCEMENT',
        link: '/jobs',
        isRead: true,
        readAt: new Date(now - 10 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'Batch Applications Milestone',
        message: '120 total student applications submitted across 5 active campus drives.',
        type: 'APPLICATION_UPDATE',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 9 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'Online Assessment Scheduled',
        message: 'Google India Technical Assessment scheduled for 45 eligible CSE/IT candidates.',
        type: 'ASSESSMENT_INVITATION',
        link: '/assessments',
        isRead: true,
        readAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'Assessment Completion Rate: 95%',
        message: 'Assessment submissions completed with zero proctoring infractions.',
        type: 'ASSESSMENT_RESULT',
        link: '/assessments',
        isRead: false,
        createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'Candidates Passed Assessment',
        message: '12 candidates cleared assessment cutoff and advanced to interview round.',
        type: 'APPLICATION_UPDATE',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'Interview Schedule Published',
        message: 'Interview slots for Google India configured in Campus Lab 302 and Virtual Meet.',
        type: 'INTERVIEW_SCHEDULED',
        link: '/applications',
        isRead: true,
        readAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'Interview Round Completed',
        message: 'Technical rounds completed. Recruiter submitted shortlist for HR round.',
        type: 'INTERVIEW_SCHEDULED',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'Offer Letters Extended',
        message: 'Google India issued official selection offers for 2 candidates at 28.5 LPA.',
        type: 'OFFER_EXTENDED',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'Offer Accepted: Alex Johnson',
        message: 'Alex Johnson (B.Tech CSE) accepted campus offer from Google India.',
        type: 'OFFER_EXTENDED',
        link: '/applications',
        isRead: false,
        createdAt: new Date(now - 18 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'Placement Milestone Reached',
        message: '85% placement milestone reached for Computer Science & Engineering batch.',
        type: 'SYSTEM_ALERT',
        link: '/reports',
        isRead: false,
        createdAt: new Date(now - 14 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'Student Verification Queue',
        message: '15 new student academic transcripts awaiting TPO officer verification.',
        type: 'STUDENT_VERIFICATION',
        link: '/students',
        isRead: false,
        createdAt: new Date(now - 10 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'Urgent Notice Broadcasted',
        message: 'Campus interview schedule notice broadcasted to 450 registered students via SMTP.',
        type: 'SYSTEM_ALERT',
        link: '/notices',
        isRead: true,
        readAt: new Date(now - 6 * 60 * 60 * 1000),
        createdAt: new Date(now - 6 * 60 * 60 * 1000)
      },
      {
        recipient: adminUser._id,
        recipientRole: 'admin',
        title: 'Annual Placement Report Ready',
        message: 'Consolidated 2025-26 Placement Report with CTC analytics ready for export.',
        type: 'SYSTEM_ALERT',
        link: '/reports',
        isRead: false,
        createdAt: new Date(now - 2 * 60 * 60 * 1000)
      }
    ];

    await Notification.insertMany([...studentNotifications, ...recruiterNotifications, ...adminNotifications]);

    // 8. Seed Realistic Database-Driven Emails in EmailLog
    const emailLogs = [
      // Student Emails
      {
        sender: 'Google India Talent Acquisition',
        senderId: companyUser._id,
        senderRole: 'company',
        recipient: 'student@placement.com',
        recipientId: studentUser._id,
        recipientRole: 'student',
        recipientEmails: ['student@placement.com'],
        recipientCount: 1,
        subject: 'Online Assessment Invitation — Google India | Full Stack Software Engineer',
        type: 'Assessment Invitation',
        template: 'Assessment Invitation',
        recipientGroup: 'Custom Recipients',
        relatedEntity: 'Assessment',
        body: `Dear Alex Johnson,\n\nYou have been invited to participate in the online technical assessment for the Full Stack Software Engineer position at Google India.\n\nAssessment Duration: 60 Minutes\nAssessment Window: Open for 48 Hours\nPlatform: Placement Pro Assessment Hub\n\nPlease log in to the Placement Management Portal and complete the assessment within the specified window.\n\nRegards,\nCampus Talent Acquisition\nGoogle India`,
        status: 'Delivered',
        isRead: false,
        sentAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000)
      },
      {
        sender: 'University Placement Cell',
        senderId: adminUser._id,
        senderRole: 'admin',
        recipient: 'student@placement.com',
        recipientId: studentUser._id,
        recipientRole: 'student',
        recipientEmails: ['student@placement.com'],
        recipientCount: 1,
        subject: 'Interview Scheduled — Google India | Technical Round 1',
        type: 'Interview Scheduled',
        template: 'Interview Schedule',
        recipientGroup: 'Custom Recipients',
        relatedEntity: 'Interview',
        body: `Dear Alex Johnson,\n\nYou have been shortlisted for the Technical Round 1 interview for the position of Full Stack Software Engineer at Google India.\n\nDate: Friday, September 14, 2026\nTime: 10:00 AM IST\nMode: Virtual Interview / Google Meet\nMeeting Link: https://meet.google.com/xyz-pmst-tpo\nInterviewer: Sarah Jenkins (Lead Systems Architect)\n\nPlease be available 10 minutes before your scheduled slot with your camera active and an updated resume.\n\nRegards,\nTraining & Placement Office`,
        status: 'Delivered',
        isRead: false,
        sentAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000)
      },
      {
        sender: 'University Placement Cell',
        senderId: adminUser._id,
        senderRole: 'admin',
        recipient: 'student@placement.com',
        recipientId: studentUser._id,
        recipientRole: 'student',
        recipientEmails: ['student@placement.com'],
        recipientCount: 1,
        subject: 'Final Selection & Offer Letter — Google India | Congratulations',
        type: 'Final Selection',
        template: 'Offer Letter',
        recipientGroup: 'Custom Recipients',
        relatedEntity: 'Offer',
        body: `Dear Alex Johnson,\n\nCongratulations!\n\nWe are pleased to inform you that you have successfully completed all technical and managerial rounds for the Full Stack Software Engineer position at Google India.\n\nPackage Offered: 28.5 LPA\nLocation: Bangalore, Karnataka\n\nYour formal offer letter has been uploaded to your Placement Management Portal account. Please review and record your acceptance.\n\nRegards,\nDirector, Training & Placement Cell`,
        status: 'Delivered',
        isRead: false,
        sentAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000)
      },
      {
        sender: 'Microsoft IDC Recruitment',
        senderId: companyUser._id,
        senderRole: 'company',
        recipient: 'student@placement.com',
        recipientId: studentUser._id,
        recipientRole: 'student',
        recipientEmails: ['student@placement.com'],
        recipientCount: 1,
        subject: 'Application Registered — Microsoft IDC | Cloud Solutions Architect',
        type: 'Application Update',
        template: 'Application Acknowledgment',
        recipientGroup: 'Custom Recipients',
        relatedEntity: 'Application',
        body: `Dear Alex Johnson,\n\nYour application for Cloud Solutions Architect (24.0 LPA) at Microsoft IDC has been received. TPO verification is complete and candidate screening is underway.\n\nRegards,\nMicrosoft University Hiring`,
        status: 'Delivered',
        isRead: true,
        readAt: new Date(now - 6 * 24 * 60 * 60 * 1000),
        sentAt: new Date(now - 6 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 6 * 24 * 60 * 60 * 1000)
      },
      {
        sender: 'University Placement Cell',
        senderId: adminUser._id,
        senderRole: 'admin',
        recipient: 'student@placement.com',
        recipientId: studentUser._id,
        recipientRole: 'student',
        recipientEmails: ['student@placement.com'],
        recipientCount: 1,
        subject: 'TPO Placement Notice: Mandatory Resume Verification',
        type: 'Notice Broadcast',
        template: 'Notice Broadcast',
        recipientGroup: 'All Students',
        relatedEntity: 'Notice',
        body: `Dear Candidate,\n\nAll 4th Year B.Tech students are requested to ensure academic marks and profile documents are verified before the upcoming Tier-1 recruiter drives commence.\n\nRegards,\nPlacement Office`,
        status: 'Delivered',
        isRead: true,
        readAt: new Date(now - 12 * 60 * 60 * 1000),
        sentAt: new Date(now - 12 * 60 * 60 * 1000),
        createdAt: new Date(now - 12 * 60 * 60 * 1000)
      },
      // Recruiter Emails
      {
        sender: 'University Placement Cell',
        senderId: adminUser._id,
        senderRole: 'admin',
        recipient: 'company@placement.com',
        recipientId: companyUser._id,
        recipientRole: 'company',
        recipientEmails: ['company@placement.com'],
        recipientCount: 1,
        subject: 'Corporate Partnership Approved — University Placement Cell',
        type: 'Company Approval',
        template: 'Partnership Approval',
        recipientGroup: 'Recruiters',
        relatedEntity: 'Company',
        body: `Dear Tech HR Recruiter,\n\nYour corporate recruiting account has been approved by the University Placement Cell. You can now publish JNFs, manage assessment test links, and review shortlisted candidate profiles.\n\nRegards,\nTraining & Placement Officer`,
        status: 'Delivered',
        isRead: true,
        readAt: new Date(now - 11 * 24 * 60 * 60 * 1000),
        sentAt: new Date(now - 11 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 11 * 24 * 60 * 60 * 1000)
      },
      {
        sender: 'University Placement Cell',
        senderId: adminUser._id,
        senderRole: 'admin',
        recipient: 'company@placement.com',
        recipientId: companyUser._id,
        recipientRole: 'company',
        recipientEmails: ['company@placement.com'],
        recipientCount: 1,
        subject: 'Candidate Applications Batch Ready — Google India SDE Drive',
        type: 'Application Update',
        template: 'Application Batch',
        recipientGroup: 'Recruiters',
        relatedEntity: 'Job',
        body: `Dear HR Team,\n\n45 verified student applications have been received for your Full Stack Software Engineer drive. Resumes and academic scorecards are accessible in your Candidate Pipeline.\n\nRegards,\nTPO Technical Cell`,
        status: 'Delivered',
        isRead: false,
        sentAt: new Date(now - 8 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 8 * 24 * 60 * 60 * 1000)
      },
      {
        sender: 'Placement Portal Assessment Engine',
        senderRole: 'system',
        recipient: 'company@placement.com',
        recipientId: companyUser._id,
        recipientRole: 'company',
        recipientEmails: ['company@placement.com'],
        recipientCount: 1,
        subject: 'Assessment Completion Telemetry — 32 Submissions Received',
        type: 'Assessment Result',
        template: 'Assessment Summary',
        recipientGroup: 'Recruiters',
        relatedEntity: 'Assessment',
        body: `Dear Recruiter,\n\n32 candidates completed the online coding assessment for Full Stack Software Engineer. Detailed evaluation scorecards and rank lists have been compiled.\n\nRegards,\nPlacement Assessment Engine`,
        status: 'Delivered',
        isRead: false,
        sentAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000)
      },
      {
        sender: 'University Placement Cell',
        senderId: adminUser._id,
        senderRole: 'admin',
        recipient: 'company@placement.com',
        recipientId: companyUser._id,
        recipientRole: 'company',
        recipientEmails: ['company@placement.com'],
        recipientCount: 1,
        subject: 'Offer Acceptance Notification — Alex Johnson',
        type: 'Final Selection',
        template: 'Offer Acceptance',
        recipientGroup: 'Recruiters',
        relatedEntity: 'Offer',
        body: `Dear Recruiter,\n\nCandidate Alex Johnson (STU2026001) has formally accepted the campus placement offer for Full Stack Software Engineer (28.5 LPA).\n\nRegards,\nPlacement Office`,
        status: 'Delivered',
        isRead: false,
        sentAt: new Date(now - 16 * 60 * 60 * 1000),
        createdAt: new Date(now - 16 * 60 * 60 * 1000)
      },
      // Admin Inbound / Outbound Records
      {
        sender: 'Microsoft IDC Campus Hiring',
        senderRole: 'company',
        recipient: 'admin@placement.com',
        recipientId: adminUser._id,
        recipientRole: 'admin',
        recipientEmails: ['admin@placement.com'],
        recipientCount: 1,
        subject: 'Corporate Partnership Accreditation Request — Microsoft IDC',
        type: 'Company Approval',
        template: 'Accreditation Request',
        recipientGroup: 'Placement Office',
        relatedEntity: 'Company',
        body: `Dear Placement Director,\n\nMicrosoft IDC has submitted registration details and JNF for Cloud Solutions Architect (24.0 LPA). Kindly review and approve our drive schedule.\n\nRegards,\nDavid Miller (Director, University Relations)`,
        status: 'Delivered',
        isRead: false,
        sentAt: new Date(now - 12 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 12 * 24 * 60 * 60 * 1000)
      },
      {
        sender: 'Placement Portal Analytics',
        senderRole: 'system',
        recipient: 'admin@placement.com',
        recipientId: adminUser._id,
        recipientRole: 'admin',
        recipientEmails: ['admin@placement.com'],
        recipientCount: 1,
        subject: 'Weekly Placement Progress Telemetry & Metrics',
        type: 'System Alert',
        template: 'Weekly Telemetry',
        recipientGroup: 'Placement Office',
        relatedEntity: 'System',
        body: `Dear TPO Director,\n\nWeekly telemetry: 5 active drives, 120 applications submitted, 35 assessments completed, 4 offers extended.\n\nRegards,\nPlacement Pro Analytics Engine`,
        status: 'Delivered',
        isRead: false,
        sentAt: new Date(now - 18 * 60 * 60 * 1000),
        createdAt: new Date(now - 18 * 60 * 60 * 1000)
      },
      {
        sender: 'University Placement Cell',
        senderId: adminUser._id,
        senderRole: 'admin',
        recipient: 'All CSE & IT Shortlisted Candidates',
        recipientRole: 'student',
        recipientEmails: ['student@placement.com', 'ananya.roy@student.edu', 'divya.sharma@student.edu'],
        recipientCount: 45,
        subject: '📢 Urgent: Google India Technical Interview Schedule Released',
        type: 'Notice Broadcast',
        template: 'Interview Broadcast',
        recipientGroup: 'Specific Branch',
        relatedEntity: 'Notice',
        body: `Dear Candidates, The technical interview rounds for Google India Software Engineer drive are scheduled for tomorrow starting 09:30 AM in Lab 302. Please ensure your college ID and updated resume are ready.`,
        successCount: 45,
        failureCount: 0,
        status: 'Delivered',
        isRead: false,
        sentAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000)
      }
    ];

    await EmailLog.insertMany(emailLogs);

    console.log('✅ Auto-seeding completed successfully with rich Notifications and Mailbox logs!');

  } catch (error) {
    console.error('❌ Error during auto-seeding:', error.message);
  }
};

module.exports = seedData;
