const express = require('express');
const { createOrder, getMyOrders, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, adminOnly, getOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;