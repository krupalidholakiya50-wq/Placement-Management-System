const Student = require('../models/Student');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Offer = require('../models/Offer');

// @desc    Executive Placement Analytics Aggregation API
// @route   GET /api/reports/analytics
// @access  Private (Admin / Company / Student)
exports.getAnalytics = async (req, res, next) => {
  try {
    const [
      totalStudents,
      verifiedStudents,
      placedStudents,
      blacklistedStudents,
      unplacedStudents,
      totalApplications,
      totalJobs,
      totalCompanies,
      totalOffers
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ verificationStatus: 'Verified' }),
      Student.countDocuments({ placementStatus: 'Placed' }),
      Student.countDocuments({ placementStatus: 'Blacklisted' }),
      Student.countDocuments({ placementStatus: 'Unplaced' }),
      Application.countDocuments(),
      Job.countDocuments(),
      Company.countDocuments(),
      Offer.countDocuments()
    ]);

    const placementRate = totalStudents > 0 
      ? Number(((placedStudents / totalStudents) * 100).toFixed(1)) 
      : 0;

    // Salary package analytics from placed students / offers / active jobs
    const salaryStats = await Student.aggregate([
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

    let highestPackage = 0;
    let avgPackage = 0;
    let lowestPackage = 0;
    let dreamOffersCount = 0;

    if (salaryStats.length > 0) {
      highestPackage = Number(salaryStats[0].highestPackage.toFixed(1));
      avgPackage = Number(salaryStats[0].avgPackage.toFixed(1));
      lowestPackage = Number(salaryStats[0].lowestPackage.toFixed(1));
      dreamOffersCount = salaryStats[0].dreamOffersCount || 0;
    } else {
      // If no students placed yet, inspect posted job packages to provide indicative drive metrics
      const jobSalaryStats = await Job.aggregate([
        { $match: { salaryPackage: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            highestPackage: { $max: '$salaryPackage' },
            avgPackage: { $avg: '$salaryPackage' },
            lowestPackage: { $min: '$salaryPackage' }
          }
        }
      ]);
      if (jobSalaryStats.length > 0) {
        highestPackage = Number(jobSalaryStats[0].highestPackage.toFixed(1));
        avgPackage = Number(jobSalaryStats[0].avgPackage.toFixed(1));
        lowestPackage = Number(jobSalaryStats[0].lowestPackage.toFixed(1));
      }
    }

    // Branch-wise placement breakdown
    const branchStats = await Student.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$department', '$branch'] },
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: [{ $eq: ['$placementStatus', 'Placed'] }, 1, 0] }
          },
          avgPackage: {
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

    const branchWise = branchStats.map(b => ({
      branch: b._id || 'General',
      total: b.total,
      placed: b.placed,
      percentage: b.total > 0 ? Number(((b.placed / b.total) * 100).toFixed(1)) : 0,
      avgPackage: b.avgPackage ? Number(b.avgPackage.toFixed(1)) : (avgPackage || 0)
    }));

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
      name: c._id || 'Unknown Company',
      hires: c.hires,
      avgPackage: Number((c.avgPackage || 0).toFixed(1))
    }));

    // If no offers yet, pull top companies with job postings
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
      companyWise = topJobCompanies.map(c => ({
        name: c._id || 'Partner Recruiter',
        hires: 0,
        avgPackage: Number((c.avgPackage || 0).toFixed(1))
      }));
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
      funnelMap[item._id] = item.count;
    });

    const funnel = {
      applied: funnelMap['Applied'] || 0,
      shortlisted: (funnelMap['Resume Shortlisted'] || 0) + (funnelMap['Shortlisted'] || 0),
      aptitude: (funnelMap['Aptitude Test Cleared'] || 0) + (funnelMap['Online Test'] || 0),
      technical: (funnelMap['Technical Interview Cleared'] || 0) + (funnelMap['Tech Interview'] || 0),
      hr: (funnelMap['HR Interview Cleared'] || 0) + (funnelMap['HR Interview'] || 0),
      selected: funnelMap['Selected'] || 0,
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
        totalStudents,
        verifiedStudents,
        placedStudents,
        blacklistedStudents,
        unplacedStudents,
        totalApplications,
        totalJobs,
        totalCompanies,
        totalOffers,
        placementRate,
        highestPackage,
        avgPackage,
        lowestPackage,
        dreamOffersCount,
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
