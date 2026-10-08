const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notice = require('../models/Notice');
const User = require('../models/User');
const Offer = require('../models/Offer');
const Activity = require('../models/Activity');
const Interview = require('../models/Interview');
const Notification = require('../models/Notification');
const EmailLog = require('../models/EmailLog');
const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');

// @desc    Inject 20+ Demo Verified Relational Records for Analytics & Performance Testing
// @route   POST /api/seeder/inject-demo
// @access  Public / Admin
exports.injectDemoData = async (req, res, next) => {
  try {
    // 1. Get or create Admin, Student, and Recruiter user IDs
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

    let studentUser = await User.findOne({ email: 'student@placement.com' });
    if (!studentUser) {
      studentUser = await User.create({
        name: 'Alex Johnson',
        email: 'student@placement.com',
        password: 'student123',
        role: 'student',
        phone: '+91 9876543210',
        department: 'Computer Science'
      });
    }

    let companyUser = await User.findOne({ email: 'company@placement.com' });
    if (!companyUser) {
      companyUser = await User.create({
        name: 'Tech HR Recruiter',
        email: 'company@placement.com',
        password: 'company123',
        role: 'company',
        phone: '+91 9123456789',
        department: 'Talent Acquisition'
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
    await Notification.deleteMany({});
    await EmailLog.deleteMany({});
    await Notice.deleteMany({});
    await Assessment.deleteMany({});
    await AssessmentAttempt.deleteMany({});

    // 3. Inject 5 Corporate Partner Companies
    const companies = await Company.insertMany([
      {
        user: companyUser._id,
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
      user: s.email === studentUser.email ? studentUser._id : undefined,
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
        postedBy: companyUser._id,
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
        postedBy: companyUser._id,
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
        postedBy: companyUser._id,
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
        postedBy: companyUser._id,
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
        postedBy: companyUser._id,
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
        actorRole: 'company',
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

    // 10. Inject Online Assessments and Attempts
    const assessmentDocs = [
      {
        title: 'Google India SDE Technical Assessment 2026',
        description: 'Comprehensive evaluation covering Data Structures, Algorithms, System Design and SQL query optimization.',
        company: companies[0]._id,
        companyName: 'Google India',
        job: injectedJobs[0]._id,
        jobTitle: 'Software Development Engineer',
        durationMinutes: 45,
        startTime: new Date(now - 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(now + 10 * 24 * 60 * 60 * 1000),
        totalMarks: 100,
        passingMarks: 50,
        status: 'Published',
        createdBy: companyUser._id,
        questions: [
          {
            questionText: 'What is the average time complexity of searching in a Balanced Binary Search Tree (AVL / Red-Black)?',
            type: 'MCQ',
            options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
            correctAnswer: 1,
            marks: 25
          },
          {
            questionText: 'Which HTTP status code is returned when a client tries to access a protected resource without valid JWT credentials?',
            type: 'MCQ',
            options: ['200 OK', '400 Bad Request', '401 Unauthorized', '404 Not Found'],
            correctAnswer: 2,
            marks: 25
          },
          {
            questionText: 'In relational database design, which Normal Form eliminates transitive functional dependencies?',
            type: 'MCQ',
            options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
            correctAnswer: 2,
            marks: 25
          },
          {
            questionText: 'Which JavaScript array method creates a new array populated with the results of calling a provided function on every element?',
            type: 'MCQ',
            options: ['filter()', 'forEach()', 'map()', 'reduce()'],
            correctAnswer: 2,
            marks: 25
          }
        ]
      },
      {
        title: 'Microsoft IDC Cloud Solutions Architecture Assessment',
        description: 'Online screening for Cloud Infrastructure, Microservices, and Distributed Systems fundamentals.',
        company: companies[1]._id,
        companyName: 'Microsoft IDC',
        job: injectedJobs[1]._id,
        jobTitle: 'Cloud Solutions Architect',
        durationMinutes: 30,
        startTime: new Date(now - 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(now + 8 * 24 * 60 * 60 * 1000),
        totalMarks: 100,
        passingMarks: 50,
        status: 'Published',
        createdBy: companyUser._id,
        questions: [
          {
            questionText: 'Which protocol is standard for secure communication over the web with TLS encryption?',
            type: 'MCQ',
            options: ['FTP', 'HTTP', 'HTTPS', 'SMTP'],
            correctAnswer: 2,
            marks: 50
          },
          {
            questionText: 'What is the primary advantage of horizontal scaling (scaling out) over vertical scaling (scaling up)?',
            type: 'MCQ',
            options: ['Single point of failure', 'Elasticity and high fault tolerance with commodity hardware', 'Lower network complexity', 'Requires no load balancing'],
            correctAnswer: 1,
            marks: 50
          }
        ]
      }
    ];
    const injectedAssessments = await Assessment.insertMany(assessmentDocs);

    // Inject attempts for candidates
    const attemptDocs = [
      {
        assessment: injectedAssessments[0]._id,
        job: injectedJobs[0]._id,
        student: injectedStudents[0]._id,
        studentUser: studentUser._id,
        studentName: injectedStudents[0].fullName,
        studentEmail: injectedStudents[0].email,
        answers: [
          { questionIndex: 0, selectedOption: 1, isCorrect: true },
          { questionIndex: 1, selectedOption: 2, isCorrect: true },
          { questionIndex: 2, selectedOption: 2, isCorrect: true },
          { questionIndex: 3, selectedOption: 2, isCorrect: true }
        ],
        score: 100,
        percentage: 100,
        passed: true,
        startedAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
        submittedAt: new Date(now - 2 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000),
        status: 'Submitted'
      },
      {
        assessment: injectedAssessments[0]._id,
        job: injectedJobs[0]._id,
        student: injectedStudents[1]._id,
        studentName: injectedStudents[1].fullName,
        studentEmail: injectedStudents[1].email,
        answers: [
          { questionIndex: 0, selectedOption: 1, isCorrect: true },
          { questionIndex: 1, selectedOption: 2, isCorrect: true },
          { questionIndex: 2, selectedOption: 0, isCorrect: false },
          { questionIndex: 3, selectedOption: 2, isCorrect: true }
        ],
        score: 75,
        percentage: 75,
        passed: true,
        startedAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
        submittedAt: new Date(now - 1 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
        status: 'Submitted'
      }
    ];
    await AssessmentAttempt.insertMany(attemptDocs);

    // Inject Notice documents
    const noticeDocs = [
      {
        title: '📢 Tier-1 Campus Recruitment Drive 2026: Google India & Microsoft IDC',
        category: 'Campus Drive',
        companyName: 'University T&P Cell',
        role: 'Software Engineer & Cloud Architect',
        packageOffered: 'Up to 28.5 LPA',
        eligibilityCriteria: 'B.Tech CSE/IT Batch 2026, Min CGPA 8.0, 0 Backlogs',
        targetBranch: 'All Branches',
        priority: 'High',
        content: 'Campus placement registrations are now open for Google India (28.5 LPA) and Microsoft IDC (24.0 LPA). Please verify your academic credentials and submit JNF applications before deadlines.',
        isEmailSent: true,
        postedBy: adminUser._id
      },
      {
        title: '📋 Mandatory Academic Profile Freeze & Credential Verification Notice',
        category: 'Policy Update',
        companyName: 'Placement Directorate',
        role: 'All Branches',
        packageOffered: 'N/A',
        eligibilityCriteria: 'All 4th Year B.Tech Students',
        targetBranch: 'All Branches',
        priority: 'Urgent',
        content: 'All unverified students must upload their verified 10th, 12th, and semester grade transcripts for TPO audit lock. Unfrozen profiles will be restricted from drive shortlists.',
        isEmailSent: true,
        postedBy: adminUser._id
      },
      {
        title: '🎯 One-Student-One-Job Policy & Dream Offer Upgrade Guidelines',
        category: 'Policy Update',
        companyName: 'Placement Office',
        role: 'Campus Placement Policy',
        packageOffered: 'Dream CTC > 2x Base',
        eligibilityCriteria: 'Placed Candidates',
        targetBranch: 'All Branches',
        priority: 'Normal',
        content: 'As per university rules, once a candidate accepts an official LOI, subsequent eligibility is unlocked exclusively for Dream Offers offering at least double the existing CTC package.',
        isEmailSent: true,
        postedBy: adminUser._id
      }
    ];
    await Notice.insertMany(noticeDocs);

    // 11. Seed 15 Realistic Notification Records Per Role (Admin, Student, Company)
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

    const injectedNotifications = await Notification.insertMany([...studentNotifications, ...recruiterNotifications, ...adminNotifications]);

    // 11. Seed Realistic Database-Driven Emails in EmailLog
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

    const injectedEmailLogs = await EmailLog.insertMany(emailLogs);

    res.status(200).json({
      success: true,
      message: '⚡ 20+ Verified Students, 5 Companies, 5 Jobs, 10 Applications, Offers, Real Activities, Interviews, 45 Notifications & Mailbox records seeded successfully!',
      counts: {
        students: injectedStudents.length,
        companies: companies.length,
        jobs: injectedJobs.length,
        applications: insertedApps.length,
        offers: offerDocs.length,
        activities: activityDocs.length,
        interviews: interviewDocs.length,
        notifications: injectedNotifications.length,
        emails: injectedEmailLogs.length
      }
    });
  } catch (error) {
    next(error);
  }
};
