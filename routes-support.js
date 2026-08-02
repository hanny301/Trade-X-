const express = require('express');
const { createTicket, getMyTickets, getTickets, getTicket, updateTicketStatus } = require('../controllers/supportController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, createTicket);
router.get('/my', protect, getMyTickets);
router.get('/', protect, adminOnly, getTickets);
router.get('/:id', protect, getTicket);
router.put('/:id/status', protect, adminOnly, updateTicketStatus);

module.exports = router;