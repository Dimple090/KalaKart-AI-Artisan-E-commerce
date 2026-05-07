const Order = require('../models/Order');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const normalizeOrderItems = (orderItems = []) => orderItems.map((item) => ({
    product: item.product,
    quantity: item.quantity ?? item.qty,
    price: item.price
}));

const getRazorpayClient = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_SECRET;

    if (!key_id || !key_secret) {
        throw new Error('Razorpay credentials are not configured in environment variables');
    }

    return new Razorpay({ key_id, key_secret });
};

// @desc    Create Razorpay Order & Save Pending Order in DB
// @route   POST /api/payment/order
// @access  Private
const createOrder = async (req, res, next) => {
    try {
        const { amount, currency, orderItems, shippingAddress } = req.body;

        if (!amount || !orderItems || orderItems.length === 0) {
            res.status(400);
            throw new Error('No order items or amount provided');
        }

        const razorpay = getRazorpayClient();

        const options = {
            amount: Math.round(amount * 100), // amount in paise
            currency: currency || "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        if (!razorpayOrder) {
            res.status(500);
            throw new Error("Razorpay order creation failed");
        }

        // Create a basic order in our database
        const newOrder = new Order({
            user: req.user._id,
            orderItems: normalizeOrderItems(orderItems),
            shippingAddress,
            totalPrice: amount,
            razorpayOrderId: razorpayOrder.id,
            status: 'Pending',
            isPaid: false
        });

        await newOrder.save();

        res.json(razorpayOrder);
    } catch (error) {
        next(error);
    }
};

// @desc    Verify Razorpay Payment & Update Order Status
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
            // Payment is valid, update the order in our DB
            const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
            
            if (order) {
                order.isPaid = true;
                order.paidAt = Date.now();
                order.razorpayPaymentId = razorpay_payment_id;
                order.status = 'Processing';
                await order.save();
                
                res.json({ success: true, message: "Payment verified and order updated" });
            } else {
                res.status(404);
                throw new Error("Order not found for this payment");
            }
        } else {
            res.status(400);
            throw new Error("Invalid signature sent!");
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { createOrder, verifyPayment };
