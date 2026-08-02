const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, emailRule, passwordRule, nameRule } = require('../middleware/validation');

const router = express.Router();

router.post('/register',
  validate([
    nameRule,
    emailRule,
    passwordRule,
  ]),
  register
);

router.post('/login',
  validate([
    emailRule,
    body('password').notEmpty().withMessage('Password required'),
  ]),
  login
);

router.get('/me', protect, getMe);

module.exports = router;