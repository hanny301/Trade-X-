const crypto = require('crypto');

/**
 * Generate a unique license key
 * Format: TRX-XXXX-XXXX-XXXX
 */
const generateLicenseKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = 'TRX-';
  for (let i = 0; i < 3; i++) {
    let part = '';
    for (let j = 0; j < 4; j++) {
      part += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    key += part + (i < 2 ? '-' : '');
  }
  return key;
};

/**
 * Create a new license for a completed order
 */
const createLicenseForOrder = async (order, user, product, License) => {
  const key = generateLicenseKey();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year

  const license = new License({
    key,
    user: user._id,
    product: product._id,
    order: order._id,
    expiryDate,
    maxActivations: 2,
  });
  await license.save();
  return license;
};

module.exports = { generateLicenseKey, createLicenseForOrder };