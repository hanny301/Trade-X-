const express = require('express');
const { getMyLicenses, getLicenses, createLicense, updateLicense, deleteLicense } = require('../controllers/licenseController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, getMyLicenses);
router.route('/')
  .get(protect, adminOnly, getLicenses)
  .post(protect, adminOnly, createLicense);
router.route('/:id')
  .put(protect, adminOnly, updateLicense)
  .delete(protect, adminOnly, deleteLicense);

module.exports = router;