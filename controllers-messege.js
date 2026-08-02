const Message = require('../models/Message');
const Ticket = require('../models/Ticket');

// @desc    Send message to ticket/conversation
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { ticketId, conversationId, text, attachments } = req.body;
    const sender = req.user.role === 'admin' ? 'admin' : 'user';

    // If ticketId provided, ensure ticket exists and user has access
    let ticket = null;
    if (ticketId) {
      ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }
      // Check access: admin or owner
      if (req.user.role !== 'admin' && ticket.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const message = await Message.create({
      ticket: ticketId || null,
      conversationId: conversationId || (ticket ? ticket.user.toString() : req.user._id.toString()),
      sender,
      senderUser: req.user._id,
      text: text || '',
      attachments: attachments || [],
    });

    // If ticket, update its updatedAt
    if (ticket) {
      ticket.updatedAt = new Date();
      await ticket.save();
    }

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for conversation
// @route   GET /api/messages/conversation/:convId
// @access  Private
const getConversationMessages = async (req, res, next) => {
  try {
    const { convId } = req.params;
    // Check access: admin or user matches convId
    if (req.user.role !== 'admin' && req.user._id.toString() !== convId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ conversationId: convId }).sort('createdAt');
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:convId
// @access  Private
const markRead = async (req, res, next) => {
  try {
    const { convId } = req.params;
    await Message.updateMany(
      { conversationId: convId, sender: 'user', read: false },
      { read: true }
    );
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getConversationMessages, markRead };