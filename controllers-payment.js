const Payment = require('../models/Payment');

// @desc    Get user's payments
// @route   GET /api/payments/my
// @access  Private
const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('order', 'product amount');
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (admin)
// @route   GET /api/payments
// @access  Private/Admin
const getPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('order', 'product amount');
    res.json(payments);
  } catch (error) {
    next(error);
  }
};

// @desc    Refund payment (admin)
// @route   PUT /api/payments/:id/refund
// @access  Private/Admin
const refundPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    if (payment.status === 'refunded') {
      return res.status(400).json({ message: 'Already refunded' });
    }
    payment.status = 'refunded';
    await payment.save();
    // Also update order status?
    res.json({ message: 'Payment refunded', payment });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyPayments, getPayments, refundPayment };