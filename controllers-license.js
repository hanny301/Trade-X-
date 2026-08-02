const License = require('../models/License');
const { generateLicenseKey } = require('../services/licenseService');

// @desc    Get user's licenses
// @route   GET /api/licenses/my
// @access  Private
const getMyLicenses = async (req, res, next) => {
  try {
    const licenses = await License.find({ user: req.user._id })
      .populate('product', 'name price');
    res.json(licenses);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all licenses (admin)
// @route   GET /api/licenses
// @access  Private/Admin
const getLicenses = async (req, res, next) => {
  try {
    const licenses = await License.find()
      .populate('user', 'name email')
      .populate('product', 'name');
    res.json(licenses);
  } catch (error) {
    next(error);
  }
};

// @desc    Create license manually (admin)
// @route   POST /api/licenses
// @access  Private/Admin
const createLicense = async (req, res, next) => {
  try {
    const { userId, productId, maxActivations, expiryDays } = req.body;
    const key = generateLicenseKey();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (expiryDays || 365));

    const license = await License.create({
      key,
      user: userId,
      product: productId,
      maxActivations: maxActivations || 2,
      expiryDate,
    });
    res.status(201).json(license);
  } catch (error) {
    next(error);
  }
};

// @desc    Update license (revoke, etc)
// @route   PUT /api/licenses/:id
// @access  Private/Admin
const updateLicense = async (req, res, next) => {
  try {
    const { status, maxActivations } = req.body;
    const license = await License.findById(req.params.id);
    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }
    if (status) license.status = status;
    if (maxActivations) license.maxActivations = maxActivations;
    await license.save();
    res.json(license);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete license (admin)
// @route   DELETE /api/licenses/:id
// @access  Private/Admin
const deleteLicense = async (req, res, next) => {
  try {
    const license = await License.findById(req.params.id);
    if (!license) {
      return res.status(404).json({ message: 'License not found' });
    }
    await license.remove();
    res.json({ message: 'License deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyLicenses, getLicenses, createLicense, updateLicense, deleteLicense };