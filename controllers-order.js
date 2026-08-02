const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Payment = require('../models/Payment');
const License = require('../models/License');
const { createLicenseForOrder } = require('../services/licenseService');
const { sendLicenseEmail } = require('../services/emailService');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already owns this product (completed order)
    const existing = await Order.findOne({ user: user._id, product: productId, status: 'completed' });
    if (existing) {
      return res.status(400).json({ message: 'You already own this product' });
    }

    const order = await Order.create({
      user: user._id,
      product: product._id,
      amount: product.price,
      status: 'pending',
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('product', 'name price')
      .populate('paymentId')
      .populate('licenseId');
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('product', 'name price')
      .populate('paymentId')
      .populate('licenseId');
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('user').populate('product');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // If completed, generate license and payment
    if (status === 'completed') {
      // Create payment record (simulate)
      const payment = await Payment.create({
        user: order.user._id,
        order: order._id,
        amount: order.amount,
        method: 'credit_card',
        status: 'completed',
        transactionId: 'txn_' + Date.now(),
      });
      order.paymentId = payment._id;

      // Generate license
      const license = await createLicenseForOrder(order, order.user, order.product, License);
      order.licenseId = license._id;
      await order.save();

      // Send license email
      await sendLicenseEmail(order.user, license, order.product);
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getMyOrders, getOrders, updateOrderStatus };