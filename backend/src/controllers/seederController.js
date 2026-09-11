const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notice = require('../models/Notice');
const User = require('../models/User');
const Offer = require('../models/Offer');
const Activity = require('../models/Activity');
const Interview = require('../models/Interview');

// @desc    Inject 20+ Demo Verified Relational Records for Analytics & Performance Testing
// @route   POST /api/seeder/inject-demo
// @access  Public / Admin
exports.injectDemoData = async (req, res, next) => {
  try {
    // 1. Get or create Admin user ID
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'TPO Director (Admin)',
        email: 'admin@placement.com',
        password: 'admin123',
        role: 'admin',
        phone: '+91 9998887770',
        department: 'Placement Cell'
      });
    }

    // 2. Clear old data except users
    await Student.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Offer.deleteMany({});
    await Activity.deleteMany({});
    await Interview.deleteMany({});

    // 3. Inject 5 Corporate Partner Companies
    const companies = await Company.insertMany([
      {
        name: 'Google India',
        logoUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?auto=format&fit=crop&w=150&q=80',
        hrName: 'Sarah Jenkins',
        hrEmail: 'careers-india@google.com',
        hrPhone: '+91 80 1234 5678',
        website: 'https://careers.google.com',
        location: 'Bangalore, Karnataka',
        employeeCount: '10,000+ Employees',
        industry: 'Product Development',
        status: 'Active',
        description: 'Global technology leader specializing in search algorithms, cloud computing, and AI systems.'
      },
      {
        name: 'Microsoft IDC',
        logoUrl: 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&w=150&q=80',
        hrName: 'David Miller',
        hrEmail: 'recruitment@microsoft.com',
        hrPhone: '+91 40 8877 6655',
        website: 'https://careers.microsoft.com',
        location: 'Hyderabad, Telangana',
        employeeCount: '5,000 - 10,000 Employees',
        industry: 'Cloud & Systems',
        status: 'Active',
        description: 'Developing Azure Cloud infrastructure, Windows OS, and enterprise developer tools.'
      },
      {
        name: 'Amazon Web Services',
        logoUrl: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=150&q=80',
        hrName: 'Priya Sharma',
        hrEmail: 'aws-hiring@amazon.com',
        hrPhone: '+91 80 9988 1122',
        website: 'https://amazon.jobs',
        location: 'Bangalore / Remote',
        employeeCount: '10,000+ Employees',
        industry: 'Cloud Infrastructure',
        status: 'Active',
        description: 'World leading cloud provider offering serverless, compute, and database solutions.'
      },
      {
        name: 'Accenture Technology',
        logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&q=80',
        hrName: 'Vikram Malhotra',
        hrEmail: 'campus@accenture.com',
        hrPhone: '+91 22 1122 3344',
        website: 'https://accenture.com/careers',
        location: 'Pune / Gurgaon',
        employeeCount: '50,000+ Employees',
        industry: 'IT Services & Consulting',
        status: 'Active',
        description: 'Global management consulting and professional IT services firm.'
      },
      {
        name: 'TCS Digital',
        logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=150&q=80',
        hrName: 'Rajesh Kumar',
        hrEmail: 'campus@tcs.com',
        hrPhone: '+91 22 4455 6677',
        website: 'https://nextstep.tcs.com',
        location: 'Mumbai, Maharashtra',
        employeeCount: '100,000+ Employees',
        industry: 'IT & Digital Solutions',
        status: 'Active',
        description: 'Leading global IT services, consulting, and business solutions organization.'
      }
    ]);

    // 4. Inject 20 Verified Student Profiles (Diverse Metrics & Statuses)
    const branches = ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE', 'B.Tech ME', 'B.Tech Civil'];
    const sampleStudents = [
      { name: 'Alex Johnson', email: 'student@placement.com', branch: 'B.Tech CSE', cgpa: 9.1, tenth: 92.0, twelfth: 89.5, backlogs: 0, status: 'Placed', company: 'Google India', package: 28.5 },
      { name: 'Emily Watson', email: 'emily.watson@student.edu', branch: 'B.Tech IT', cgpa: 8.8, tenth: 88.0, twelfth: 86.0, backlogs: 0, status: 'Placed', company: 'Microsoft IDC', package: 24.0 },
      { name: 'Rohan Mehta', email: 'rohan.mehta@student.edu', branch: 'B.Tech ECE', cgpa: 7.9, tenth: 81.0, twelfth: 78.0, backlogs: 0, status: 'Unplaced' },
      { name: 'Sophia Davis', email: 'sophia.davis@student.edu', branch: 'B.Tech ME', cgpa: 8.2, tenth: 85.0, twelfth: 84.0, backlogs: 0, status: 'Unplaced' },
      { name: 'Karan Patel', email: 'karan.patel@student.edu', branch: 'B.Tech CSE', cgpa: 8.9, tenth: 90.0, twelfth: 88.0, backlogs: 0, status: 'Placed', company: 'Amazon Web Services', package: 18.5 },
      { name: 'Ananya Roy', email: 'ananya.roy@student.edu', branch: 'B.Tech IT', cgpa: 9.4, tenth: 95.0, twelfth: 93.0, backlogs: 0, status: 'Placed', company: 'Google India', package: 28.5 },
      { name: 'Rahul Verma', email: 'rahul.verma@student.edu', branch: 'B.Tech ECE', cgpa: 7.2, tenth: 75.0, twelfth: 72.0, backlogs: 1, status: 'Unplaced' },
      { name: 'Priya Nair', email: 'priya.nair@student.edu', branch: 'B.Tech CSE', cgpa: 8.6, tenth: 89.0, twelfth: 87.0, backlogs: 0, status: 'Placed', company: 'Accenture Technology', package: 11.5 },
      { name: 'Aditya Singh', email: 'aditya.singh@student.edu', branch: 'B.Tech ME', cgpa: 6.8, tenth: 70.0, twelfth: 68.0, backlogs: 2, status: 'Unplaced' },
      { name: 'Sneha Rao', email: 'sneha.rao@student.edu', branch: 'B.Tech IT', cgpa: 8.4, tenth: 86.0, twelfth: 85.0, backlogs: 0, status: 'Unplaced' },
      { name: 'Vikram Gupta', email: 'vikram.gupta@student.edu', branch: 'B.Tech Civil', cgpa: 7.5, tenth: 78.0, twelfth: 76.0, backlogs: 0, status: 'Unplaced' },
      { name: 'Divya Sharma', email: 'divya.sharma@student.edu', branch: 'B.Tech CSE', cgpa: 9.0, tenth: 91.0, twelfth: 90.0, backlogs: 0, status: 'Placed', company: 'Microsoft IDC', package: 24.0 },
      { name: 'Arjun Das', email: 'arjun.das@student.edu', branch: 'B.Tech ECE', cgpa: 6.5, tenth: 68.0, twelfth: 65.0, backlogs: 1, status: 'Blacklisted', blacklistedUntilDrives: 3 },
      { name: 'Neha Joshi', email: 'neha.joshi@student.edu', branch: 'B.Tech IT', cgpa: 8.7, tenth: 88.0, twelfth: 87.0, backlogs: 0, status: 'Unplaced' },
      { name: 'Varun Reddy', email: 'varun.reddy@student.edu', branch: 'B.Tech CSE', cgpa: 8.3, tenth: 84.0, twelfth: 82.0, backlogs: 0, status: 'Unplaced' },
      { name: 'Meera Kapoor', email: 'meera.kapoor@student.edu', branch: 'B.Tech ECE', cgpa: 7.8, tenth: 80.0, twelfth: 79.0, backlogs: 0, status: 'Unplaced' },
      { name: 'Siddharth Sen', email: 'siddharth.sen@student.edu', branch: 'B.Tech ME', cgpa: 7.4, tenth: 76.0, twelfth: 74.0, backlogs: 0, status: 'Unplaced' },
      { name: 'Ishita Saxena', email: 'ishita.saxena@student.edu', branch: 'B.Tech CSE', cgpa: 9.2, tenth: 93.0, twelfth: 91.0, backlogs: 0, status: 'Placed', company: 'Amazon Web Services', package: 18.5 },
      { name: 'Manish Kumar', email: 'manish.kumar@student.edu', branch: 'B.Tech IT', cgpa: 7.1, tenth: 72.0, twelfth: 70.0, backlogs: 0, status: 'Unplaced' },
      { name: 'Ritu Agarwal', email: 'ritu.agarwal@student.edu', branch: 'B.Tech ECE', cgpa: 8.5, tenth: 87.0, twelfth: 86.0, backlogs: 0, status: 'Unplaced' }
    ];

    const studentDocs = sampleStudents.map((s, idx) => ({
      studentId: `STU20260${idx + 1 < 10 ? '0' + (idx + 1) : idx + 1}`,
      fullName: s.name,
      email: s.email,
      phone: `+91 98765${10000 + idx}`,
      department: s.branch.includes('CSE') ? 'Computer Science' : s.branch.includes('IT') ? 'Information Technology' : 'Electronics',
      branch: s.branch,
      semester: '7th Semester',
      year: '4th Year',
      cgpa: s.cgpa,
      tenthPercentage: s.tenth,
      twelfthPercentage: s.twelfth,
      backlogs: s.backlogs,
      verificationStatus: 'Verified',
      isFrozen: true,
      placementStatus: s.status,
      placedCompany: s.company || (s.status === 'Placed' ? 'Partner Corp' : ''),
      placedPackage: s.package || 0,
      resumeUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }));

    const injectedStudents = await Student.insertMany(studentDocs);

    // 5. Inject 5 Distinct Job Drives with Deadlines (Active & Expired Deadlines)
    const now = Date.now();
    const jobDocs = [
      {
        title: 'Software Development Engineer',
        company: companies[0]._id,
        companyName: 'Google India',
        salaryPackage: 28.5,
        location: 'Bangalore / Hybrid',
        jobType: 'Full Time',
        minCgpa: 8.5,
        min10thPercent: 80.0,
        min12thPercent: 80.0,
        maxBacklogs: 0,
        eligibleBranches: ['B.Tech CSE', 'B.Tech IT'],
        bond: 'No Service Bond',
        approvalStatus: 'Approved',
        status: 'Active',
        description: 'Build high-concurrency cloud microservices and web platform systems.',
        deadline: new Date(now + 30 * 24 * 60 * 60 * 1000) // Active: 30 days future
      },
      {
        title: 'Cloud Solutions Architect',
        company: companies[1]._id,
        companyName: 'Microsoft IDC',
        salaryPackage: 24.0,
        location: 'Hyderabad',
        jobType: 'Full Time',
        minCgpa: 8.0,
        min10thPercent: 75.0,
        min12thPercent: 75.0,
        maxBacklogs: 0,
        eligibleBranches: ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE'],
        bond: 'No Service Bond',
        approvalStatus: 'Approved',
        status: 'Active',
        description: 'Architect mission-critical Azure cloud infrastructure services.',
        deadline: new Date(now + 15 * 24 * 60 * 60 * 1000) // Active: 15 days future
      },
      {
        title: 'DevOps & Backend Engineer',
        company: companies[2]._id,
        companyName: 'Amazon Web Services',
        salaryPackage: 18.5,
        location: 'Bangalore / Remote',
        jobType: 'Internship + Full Time',
        minCgpa: 7.5,
        min10thPercent: 70.0,
        min12thPercent: 70.0,
        maxBacklogs: 1,
        eligibleBranches: ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE', 'B.Tech ME'],
        bond: 'No Service Bond',
        approvalStatus: 'Approved',
        status: 'Active',
        description: 'Develop automated deployment pipelines and serverless API handlers.',
        deadline: new Date(now + 10 * 24 * 60 * 60 * 1000) // Active: 10 days future
      },
      {
        title: 'Digital Systems Associate',
        company: companies[3]._id,
        companyName: 'Accenture Technology',
        salaryPackage: 11.5,
        location: 'Pune / Gurgaon',
        jobType: 'Full Time',
        minCgpa: 7.0,
        min10thPercent: 65.0,
        min12thPercent: 65.0,
        maxBacklogs: 1,
        eligibleBranches: ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE', 'B.Tech ME', 'B.Tech Civil'],
        bond: '1 Year Agreement',
        approvalStatus: 'Approved',
        status: 'Active',
        description: 'Digital transformation consulting, Java spring boot APIs and cloud maintenance.',
        deadline: new Date(now + 5 * 24 * 60 * 60 * 1000) // Active: 5 days future
      },
      {
        title: 'Early Career Systems Engineer (Expired Deadline)',
        company: companies[4]._id,
        companyName: 'TCS Digital',
        salaryPackage: 7.5,
        location: 'Mumbai',
        jobType: 'Full Time',
        minCgpa: 6.5,
        min10thPercent: 60.0,
        min12thPercent: 60.0,
        maxBacklogs: 2,
        eligibleBranches: ['B.Tech CSE', 'B.Tech IT', 'B.Tech ECE', 'B.Tech ME', 'B.Tech Civil'],
        bond: '2 Year Service Bond',
        approvalStatus: 'Approved',
        status: 'Active',
        description: 'Legacy IT migration, enterprise automation, and customer platform support.',
        deadline: new Date(now - 2 * 24 * 60 * 60 * 1000) // EXPIRED: 2 days in past
      }
    ];

    const injectedJobs = await Job.insertMany(jobDocs);

    // 6. Inject 10 Multi-Stage Active Applications across 7 rounds
    const rounds = [
      'Applied',
      'Resume Shortlisted',
      'Aptitude Test Cleared',
      'Group Discussion Cleared',
      'Technical Interview Cleared',
      'HR Interview Cleared',
      'Selected'
    ];

    const appDocs = injectedStudents.slice(0, 10).map((student, idx) => {
      const targetJob = injectedJobs[idx % injectedJobs.length];
      const assignedRound = rounds[idx % rounds.length];

      return {
        job: targetJob._id,
        student: student._id,
        studentName: student.fullName,
        studentEmail: student.email,
        department: student.department,
        branch: student.branch,
        year: student.year,
        cgpa: student.cgpa,
        status: assignedRound,
        resumeUrl: student.resumeUrl,
        statusTimeline: [
          { status: 'Applied', updatedAt: new Date(now - 10 * 24 * 60 * 60 * 1000), note: 'Application registered.' },
          { status: assignedRound, updatedAt: new Date(now - 1 * 24 * 60 * 60 * 1000), note: `Advanced to ${assignedRound} stage.` }
        ]
      };
    });

    const insertedApps = await Application.insertMany(appDocs);

    // 7. Inject Offers for Placed students
    const placedStudents = injectedStudents.filter(s => s.placementStatus === 'Placed');
    const offerDocs = placedStudents.map((s, idx) => {
      const matchedJob = injectedJobs[idx % injectedJobs.length];
      const matchedApp = insertedApps.find(a => a.student.toString() === s._id.toString()) || insertedApps[0];
      return {
        application: matchedApp ? matchedApp._id : insertedApps[0]._id,
        job: matchedJob._id,
        student: s._id,
        studentName: s.fullName,
        companyName: s.placedCompany || matchedJob.companyName,
        role: matchedJob.title,
        packageOffered: s.placedPackage || matchedJob.salaryPackage,
        location: matchedJob.location,
        status: 'Accepted',
        respondedAt: new Date(now - 2 * 24 * 60 * 60 * 1000)
      };
    });
    await Offer.insertMany(offerDocs);

    // 8. Inject Real Activity Timeline Events
    const activityDocs = [
      {
        type: 'JOB_POSTED',
        title: 'New Drive: Google India (Software Development Engineer)',
        description: 'Package: 28.5 LPA | B.Tech CSE / IT Batch 2026',
        actor: 'Sarah Jenkins',
        actorRole: 'company',
        targetBranch: 'B.Tech CSE, B.Tech IT',
        createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'JOB_POSTED',
        title: 'New Drive: Microsoft IDC (Cloud Solutions Architect)',
        description: 'Package: 24.0 LPA | B.Tech CSE, IT, ECE',
        actor: 'David Miller',
        actorRole: 'company',
        targetBranch: 'B.Tech CSE, B.Tech IT, B.Tech ECE',
        createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'OFFER_EXTENDED',
        title: '🎉 Offer Accepted: Alex Johnson -> Google India',
        description: 'Role: Software Development Engineer | CTC: 28.5 LPA',
        actor: 'Alex Johnson',
        actorRole: 'student',
        targetBranch: 'B.Tech CSE',
        createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'OFFER_EXTENDED',
        title: '🎉 Offer Accepted: Emily Watson -> Microsoft IDC',
        description: 'Role: Cloud Solutions Architect | CTC: 24.0 LPA',
        actor: 'Emily Watson',
        actorRole: 'student',
        targetBranch: 'B.Tech IT',
        createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000)
      },
      {
        type: 'STATUS_UPDATED',
        title: 'Karan Patel -> Technical Interview Cleared',
        description: 'Drive: Amazon Web Services (DevOps & Backend Engineer)',
        actor: 'Priya Sharma',
        actorRole: 'recruiter',
        targetBranch: 'B.Tech CSE',
        createdAt: new Date(now - 12 * 60 * 60 * 1000)
      },
      {
        type: 'STUDENT_VERIFIED',
        title: 'Student Profile Verified: Ananya Roy',
        description: 'Enrollment: STU2026006 | Department: Computer Science',
        actor: 'TPO Director',
        actorRole: 'admin',
        targetBranch: 'B.Tech IT',
        createdAt: new Date(now - 6 * 60 * 60 * 1000)
      }
    ];
    await Activity.insertMany(activityDocs);

    // 9. Inject Sample Interviews
    const interviewDocs = [
      {
        job: injectedJobs[0]._id,
        student: injectedStudents[2]._id,
        company: companies[0]._id,
        roundName: 'Technical Interview',
        roundNumber: 2,
        interviewDate: new Date(now + 2 * 24 * 60 * 60 * 1000),
        meetingLink: 'https://meet.google.com/xyz-pmst-tpo',
        interviewerName: 'Sarah Jenkins (Google Tech Lead)',
        status: 'Scheduled',
        instructions: 'Please be ready with your coding IDE and camera enabled 10 minutes prior.'
      },
      {
        job: injectedJobs[1]._id,
        student: injectedStudents[3]._id,
        company: companies[1]._id,
        roundName: 'System Architecture Round',
        roundNumber: 2,
        interviewDate: new Date(now + 3 * 24 * 60 * 60 * 1000),
        meetingLink: 'https://teams.microsoft.com/l/meetup-join/19%3a789',
        interviewerName: 'David Miller (Principal Architect)',
        status: 'Scheduled',
        instructions: 'Prepare to discuss distributed systems and high-availability design.'
      }
    ];
    await Interview.insertMany(interviewDocs);

    res.status(200).json({
      success: true,
      message: '⚡ 20+ Verified Students, 5 Companies, 5 Jobs, 10 Applications, Offers, Real Activities & Interviews seeded successfully!',
      counts: {
        students: injectedStudents.length,
        companies: companies.length,
        jobs: injectedJobs.length,
        applications: insertedApps.length,
        offers: offerDocs.length,
        activities: activityDocs.length,
        interviews: interviewDocs.length
      }
    });
  } catch (error) {
    next(error);
  }
};
