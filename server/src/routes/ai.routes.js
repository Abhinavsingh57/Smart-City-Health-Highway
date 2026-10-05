const express = require('express');
const router = express.Router();
const { triageSymptoms, chat, getSlotRecommendation, getChatHistory } = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.post('/triage', triageSymptoms);
router.post('/chat', chat);

router.post('/slot-recommendation', getSlotRecommendation);
router.get('/chat-history', getChatHistory);

module.exports = router;
