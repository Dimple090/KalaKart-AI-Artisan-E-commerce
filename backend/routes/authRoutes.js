const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Disable rate limiting in test environment
const authLimiter = process.env.NODE_ENV === 'test' 
    ? (req, res, next) => next() // No-op middleware in test mode
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // Limit each IP to 10 auth requests per `windowMs`
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true,
        message: { message: 'Too many failed attempts from this IP, please try again after 15 minutes' }
    });

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

module.exports = router;
