const express = require('express');
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/config', (req, res) => {
    res.json({ keyId: process.env.RAZORPAY_KEY_ID });
});

module.exports = router;
