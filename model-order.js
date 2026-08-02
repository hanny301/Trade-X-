const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'completed', 'cancelled', 'refunded'], default: 'pending' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    licenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'License' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);