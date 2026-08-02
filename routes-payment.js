const express = require('express');
const { getMyPayments, getPayments, refundPayment } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, getMyPayments);
router.get('/', protect, adminOnly, getPayments);
router.put('/:id/refund', protect, adminOnly, refundPayment);

module.exports = router;