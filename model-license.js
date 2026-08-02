const mongoose = require('mongoose');

const LicenseSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    status: { type: String, enum: ['active', 'inactive', 'expired', 'revoked'], default: 'active' },
    expiryDate: { type: Date },
    maxActivations: { type: Number, default: 2 },
    usedActivations: { type: Number, default: 0 },
    activations: [
      {
        device: String,
        ip: String,
        activatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('License', LicenseSchema);