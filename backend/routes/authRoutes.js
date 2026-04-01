const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per `windowMs`
    message: { message: 'Too many attempts from this IP, please try again after 15 minutes' }
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

module.exports = router;
