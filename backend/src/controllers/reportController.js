const Student = require('../models/Student');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Offer = require('../models/Offer');
const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');

// @desc    Executive Placement Analytics Aggregation API
// @route   GET /api/reports/analytics
// @access  Private (Admin / Company / Student)
exports.getAnalytics = async (req, res, next) => {
  try {
    const [
      totalStudents,
      verifiedStudents,
      explicitlyPlacedStudents,
      blacklistedStudents,
      acceptedOffersCount,
      totalApplications,
      totalJobs,
      totalCompanies,
      totalOffers,
      totalAssessments,
      totalAssessmentAttempts,
      passedAssessmentAttempts
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ verificationStatus: 'Verified' }),
      Student.countDocuments({ placementStatus: 'Placed' }),
      Student.countDocuments({ placementStatus: 'Blacklisted' }),
      Offer.countDocuments({ status: 'Accepted' }),
      Application.countDocuments(),
      Job.countDocuments(),
      Company.countDocuments(),
      Offer.countDocuments(),
      Assessment.countDocuments(),
      AssessmentAttempt.countDocuments({ status: 'Submitted' }),
      AssessmentAttempt.countDocuments({ status: 'Submitted', passed: true })
    ]);

    // Reconcile placed students count (max of explicitly marked or distinct accepted offers)
    const placedStudents = Math.max(explicitlyPlacedStudents, acceptedOffersCount);
    const unplacedStudents = Math.max(0, totalStudents - placedStudents - blacklistedStudents);

    const placementRate = totalStudents > 0 
      ? Number(((placedStudents / totalStudents) * 100).toFixed(1)) 
      : 0;

    const assessmentPassRate = totalAssessmentAttempts > 0
      ? Number(((passedAssessmentAttempts / totalAssessmentAttempts) * 100).toFixed(1))
      : 0;

    // Salary package analytics from placed students
    const studentSalaryStats = await Student.aggregate([
      { $match: { placementStatus: 'Placed', placedPackage: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          highestPackage: { $max: '$placedPackage' },
          avgPackage: { $avg: '$placedPackage' },
          lowestPackage: { $min: '$placedPackage' },
          dreamOffersCount: {
            $sum: { $cond: [{ $gte: ['$placedPackage', 12.0] }, 1, 0] }
          }
        }
      }
    ]);

    // Salary package analytics from accepted offers
    const offerSalaryStats = await Offer.aggregate([
      { $match: { status: 'Accepted', packageOffered: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          highestPackage: { $max: '$packageOffered' },
          avgPackage: { $avg: '$packageOffered' },
          lowestPackage: { $min: '$packageOffered' },
          dreamOffersCount: {
            $sum: { $cond: [{ $gte: ['$packageOffered', 12.0] }, 1, 0] }
          }
        }
      }
    ]);

    // Benchmark from active job drives
    const jobSalaryStats = await Job.aggregate([
      { $match: { salaryPackage: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          highestPackage: { $max: '$salaryPackage' },
          avgPackage: { $avg: '$salaryPackage' },
          lowestPackage: { $min: '$salaryPackage' },
          dreamOffersCount: {
            $sum: { $cond: [{ $gte: ['$salaryPackage', 12.0] }, 1, 0] }
          }
        }
      }
    ]);

    let highestPackage = 0;
    let avgPackage = 0;
    let lowestPackage = 0;
    let dreamOffersCount = 0;

    if (studentSalaryStats.length > 0 && studentSalaryStats[0].avgPackage > 0) {
      highestPackage = Number(studentSalaryStats[0].highestPackage.toFixed(1));
      avgPackage = Number(studentSalaryStats[0].avgPackage.toFixed(1));
      lowestPackage = Number(studentSalaryStats[0].lowestPackage.toFixed(1));
      dreamOffersCount = studentSalaryStats[0].dreamOffersCount || 0;
    } else if (offerSalaryStats.length > 0 && offerSalaryStats[0].avgPackage > 0) {
      highestPackage = Number(offerSalaryStats[0].highestPackage.toFixed(1));
      avgPackage = Number(offerSalaryStats[0].avgPackage.toFixed(1));
      lowestPackage = Number(offerSalaryStats[0].lowestPackage.toFixed(1));
      dreamOffersCount = offerSalaryStats[0].dreamOffersCount || 0;
    } else if (jobSalaryStats.length > 0) {
      highestPackage = Number(jobSalaryStats[0].highestPackage.toFixed(1));
      avgPackage = Number(jobSalaryStats[0].avgPackage.toFixed(1));
      lowestPackage = Number(jobSalaryStats[0].lowestPackage.toFixed(1));
      dreamOffersCount = jobSalaryStats[0].dreamOffersCount || 0;
    }

    // Branch-wise placement & salary package breakdown
    const branchStats = await Student.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$branch', { $ifNull: ['$department', 'Computer Science'] }] },
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: [{ $eq: ['$placementStatus', 'Placed'] }, 1, 0] }
          },
          avgPlacedPackage: {
            $avg: {
              $cond: [
                { $and: [{ $eq: ['$placementStatus', 'Placed'] }, { $gt: ['$placedPackage', 0] }] },
                '$placedPackage',
                null
              ]
            }
          }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Active drives for salary package benchmarks per eligible branch
    const activeJobs = await Job.find({ salaryPackage: { $gt: 0 } }, 'salaryPackage eligibleBranches title companyName').lean();

    const branchWise = branchStats.map(b => {
      const branchName = b._id || 'Engineering';
      let avgPkg = 0;

      if (b.avgPlacedPackage && b.avgPlacedPackage > 0) {
        avgPkg = Number(b.avgPlacedPackage.toFixed(1));
      } else {
        // Calculate average CTC from real drives open to this branch
        const targetingJobs = activeJobs.filter(j => 
          Array.isArray(j.eligibleBranches) && (
            j.eligibleBranches.includes(branchName) ||
            j.eligibleBranches.some(eb => eb.toLowerCase().includes(branchName.toLowerCase()) || branchName.toLowerCase().includes(eb.toLowerCase()))
          )
        );

        if (targetingJobs.length > 0) {
          const sum = targetingJobs.reduce((acc, curr) => acc + (curr.salaryPackage || 0), 0);
          avgPkg = Number((sum / targetingJobs.length).toFixed(1));
        } else {
          avgPkg = avgPackage || 0;
        }
      }

      return {
        branch: branchName,
        total: b.total || 0,
        placed: b.placed || 0,
        percentage: (b.total && b.total > 0) ? Number(((b.placed / b.total) * 100).toFixed(1)) : 0,
        avgPackage: avgPkg
      };
    });

    // Company Hiring Distribution
    const companyStats = await Offer.aggregate([
      {
        $group: {
          _id: '$companyName',
          hires: { $sum: 1 },
          avgPackage: { $avg: '$packageOffered' }
        }
      },
      { $sort: { hires: -1 } },
      { $limit: 10 }
    ]);

    let companyWise = companyStats.map(c => ({
      name: c._id || 'Corporate Partner',
      hires: c.hires,
      avgPackage: Number((c.avgPackage || 0).toFixed(1))
    }));

    // If no offers yet, pull top companies with job postings or corporate directory
    if (companyWise.length === 0) {
      const topJobCompanies = await Job.aggregate([
        {
          $group: {
            _id: '$companyName',
            drives: { $sum: 1 },
            avgPackage: { $avg: '$salaryPackage' }
          }
        },
        { $sort: { drives: -1 } },
        { $limit: 6 }
      ]);

      if (topJobCompanies.length > 0) {
        companyWise = topJobCompanies.map(c => ({
          name: c._id || 'Corporate Partner',
          hires: 0,
          avgPackage: Number((c.avgPackage || 0).toFixed(1))
        }));
      } else {
        const partnerCompanies = await Company.find().limit(6).lean();
        companyWise = partnerCompanies.map(c => ({
          name: c.name || 'Corporate Partner',
          hires: 0,
          avgPackage: avgPackage || 0
        }));
      }
    }

    // 7-Stage ATS Application Funnel
    const funnelStats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const funnelMap = {};
    funnelStats.forEach(item => {
      if (item._id) {
        funnelMap[item._id] = item.count;
      }
    });

    const funnel = {
      applied: totalApplications || funnelMap['Applied'] || 0,
      shortlisted: (funnelMap['Resume Shortlisted'] || 0) + (funnelMap['Shortlisted'] || 0),
      aptitude: (funnelMap['Aptitude Test Cleared'] || 0) + (funnelMap['Online Test'] || 0) + (totalAssessmentAttempts || 0),
      technical: (funnelMap['Technical Interview Cleared'] || 0) + (funnelMap['Tech Interview'] || 0),
      hr: (funnelMap['HR Interview Cleared'] || 0) + (funnelMap['HR Interview'] || 0),
      selected: placedStudents || funnelMap['Selected'] || (funnelMap['Offered'] || 0),
      rejected: (funnelMap['Rejected'] || 0) + (funnelMap['No Show'] || 0)
    };

    // Salary Slabs Distribution
    const salarySlabs = await Student.aggregate([
      { $match: { placementStatus: 'Placed', placedPackage: { $gt: 0 } } },
      {
        $bucket: {
          groupBy: '$placedPackage',
          boundaries: [0, 6, 10, 15, 20, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents: Number(totalStudents || 0),
        verifiedStudents: Number(verifiedStudents || 0),
        placedStudents: Number(placedStudents || 0),
        blacklistedStudents: Number(blacklistedStudents || 0),
        unplacedStudents: Number(unplacedStudents || 0),
        totalApplications: Number(totalApplications || 0),
        totalJobs: Number(totalJobs || 0),
        totalCompanies: Number(totalCompanies || 0),
        totalOffers: Number(totalOffers || 0),
        totalAssessments: Number(totalAssessments || 0),
        totalAssessmentAttempts: Number(totalAssessmentAttempts || 0),
        assessmentPassRate: Number(assessmentPassRate || 0),
        placementRate: Number(placementRate || 0),
        highestPackage: Number(highestPackage || 0),
        avgPackage: Number(avgPackage || 0),
        lowestPackage: Number(lowestPackage || 0),
        dreamOffersCount: Number(dreamOffersCount || 0),
        branchWise,
        companyWise,
        funnel,
        salarySlabs
      }
    });
  } catch (error) {
    next(error);
  }
};
