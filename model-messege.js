const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
    conversationId: { type: String, required: true }, // user ID for direct chat
    sender: { type: String, enum: ['user', 'admin'], required: true },
    senderUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, default: '' },
    attachments: [
      {
        name: String,
        type: String,
        data: String, // base64 or file path
        size: Number,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    read: { type: Boolean, default: false },
    edited: { type: Boolean, default: false },
    editedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);