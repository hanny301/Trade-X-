const { body, param, query, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.param, message: e.msg })),
    });
  };
};

// Common validation rules
const emailRule = body('email').isEmail().withMessage('Valid email required').normalizeEmail();
const passwordRule = body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters');
const nameRule = body('name').trim().notEmpty().withMessage('Name is required');

module.exports = {
  validate,
  emailRule,
  passwordRule,
  nameRule,
};