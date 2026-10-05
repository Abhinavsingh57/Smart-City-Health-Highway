const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getDoctors } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.get('/doctors', getDoctors);

module.exports = router;
