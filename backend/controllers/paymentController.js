const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/order
// @access  Private
const createOrder = async (req, res, next) => {
    try {
        const { amount, currency } = req.body;

        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency: currency || "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            res.status(500);
            throw new Error("Something went wrong with Razorpay order creation");
        }

        res.json(order);
    } catch (error) {
        next(error);
    }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            res.json({ success: true, message: "Payment verified successfully" });
        } else {
            res.status(400);
            throw new Error("Invalid signature sent!");
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { createOrder, verifyPayment };
