const express = require('express');
const { sendMessage, getConversationMessages, markRead } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/', protect, upload.array('attachments', 5), sendMessage);
router.get('/conversation/:convId', protect, getConversationMessages);
router.put('/read/:convId', protect, markRead);

module.exports = router;