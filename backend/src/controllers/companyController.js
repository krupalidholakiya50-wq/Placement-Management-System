const Company = require('../models/Company');

// @desc    Get all companies (Search & Industry filtering)
// @route   GET /api/companies
// @access  Public
exports.getCompanies = async (req, res, next) => {
  try {
    let query = {};

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      query.$or = [{ name: regex }, { industry: regex }, { location: regex }];
    }

    if (req.query.industry) {
      query.industry = req.query.industry;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const companies = await Company.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Public
exports.getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company record not found' });
    }
    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new company partner
// @route   POST /api/companies
// @access  Private (Admin / Company)
exports.createCompany = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    if (req.user.role === 'company') {
      req.body.status = 'Pending Approval';
      req.body.isApprovedByAdmin = false;
    } else {
      req.body.status = 'Active';
      req.body.isApprovedByAdmin = true;
    }

    const company = await Company.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Company profile created.',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    STAGE 2: Admin TPO Approval Queue for Corporate Partners (Approve, Reject, Suspend, Activate)
// @route   PUT /api/companies/:id/approve
// @access  Private (Admin)
exports.approveCompany = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' | 'reject' | 'suspend' | 'activate'
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company record not found' });
    }

    if (action === 'approve' || action === 'activate') {
      company.status = 'Active';
      company.isApprovedByAdmin = true;
    } else if (action === 'suspend') {
      company.status = 'Suspended';
      company.isApprovedByAdmin = false;
    } else if (action === 'reject') {
      company.status = 'Pending Approval';
      company.isApprovedByAdmin = false;
    }

    await company.save();

    res.status(200).json({
      success: true,
      message: `Company status updated to ${company.status}`,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update company profile
// @route   PUT /api/companies/:id
// @access  Private (Admin / Company)
exports.updateCompany = async (req, res, next) => {
  try {
    let company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete company profile
// @route   DELETE /api/companies/:id
// @access  Private (Admin)
exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    await company.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Company record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
