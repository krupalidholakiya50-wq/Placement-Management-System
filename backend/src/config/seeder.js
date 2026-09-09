const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notice = require('../models/Notice');


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

    console.log('✅ Auto-seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during auto-seeding:', error.message);
  }
};

module.exports = seedData;
