const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['standard', 'pro', 'vip', 'custom'], default: 'standard' },
    features: [String],
    downloadLink: { type: String, default: '#' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);