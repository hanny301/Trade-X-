const Ticket = require('../models/Ticket');
const Message = require('../models/Message');

// @desc    Create ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res, next) => {
  try {
    const { subject, category, priority } = req.body;
    const ticket = await Ticket.create({
      user: req.user._id,
      subject,
      category: category || 'general',
      priority: priority || 'medium',
    });
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's tickets
// @route   GET /api/tickets/my
// @access  Private
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id });
    res.json(tickets);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets (admin)
// @route   GET /api/tickets
// @access  Private/Admin
const getTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find().populate('user', 'name email');
    res.json(tickets);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket with messages
// @route   GET /api/tickets/:id
// @access  Private
const getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('user', 'name email');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    // Check if user owns ticket or is admin
    if (req.user.role !== 'admin' && ticket.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const messages = await Message.find({ ticket: ticket._id }).sort('createdAt');
    res.json({ ticket, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status (admin)
// @route   PUT /api/tickets/:id/status
// @access  Private/Admin
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    ticket.status = status;
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

module.exports = { createTicket, getMyTickets, getTickets, getTicket, updateTicketStatus }; 