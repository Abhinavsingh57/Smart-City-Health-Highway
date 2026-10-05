const express = require('express');
const router = express.Router();
const { getChatUsers, getMessages, sendMessage } = require('../controllers/chat.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/users', getChatUsers);
router.get('/:userId', getMessages);
router.post('/', sendMessage);

module.exports = router;
