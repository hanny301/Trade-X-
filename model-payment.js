const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['credit_card', 'paypal', 'bank_transfer', 'crypto'], required: true },
    last4: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    transactionId: { type: String, unique: true, sparse: true },
    receiptUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);