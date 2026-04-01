const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res, next) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    try {
        if (orderItems && orderItems.length === 0) {
            res.status(400);
            throw new Error('No order items');
        } else {
            const order = new Order({
                orderItems,
                user: req.user._id, // Assumes middleware sets req.user
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
            });

            const createdOrder = await order.save();
            res.status(201).json(createdOrder);
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate(
            'user',
            'name email'
        );

        if (order) {
            res.json(order);
        } else {
            res.status(404);
            throw new Error('Order not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id });
        res.json(orders);
    } catch (error) {
        next(error);
    }
};

// @desc    Get logged in artisan received orders
// @route   GET /api/orders/artisan
// @access  Private (Artisan)
const getArtisanOrders = async (req, res, next) => {
    try {
        // Find all orders where at least one item's product belongs to this artisan
        // This requires joining with the Product collection (or storing artisanId in orderItems)
        const orders = await Order.find().populate('orderItems.product').populate('user', 'name email');

        // Filter orders to only include those with the artisan's products
        const artisanOrders = orders.filter(order =>
            order.orderItems.some(item =>
                item.product && item.product.artisan.toString() === req.user._id.toString()
            )
        );

        res.json(artisanOrders);
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status (Artisan only)
// @route   PUT /api/orders/:id/status
// @access  Private (Artisan)
const updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        // Verify that this order contains products from this artisan
        // We'll populate products in the check if they're not already there
        const populatedOrder = await Order.findById(req.params.id).populate('orderItems.product');
        const hasArtisanProduct = populatedOrder.orderItems.some(item => 
            item.product && item.product.artisan.toString() === req.user._id.toString()
        );

        if (!hasArtisanProduct) {
            res.status(401);
            throw new Error('User not authorized to update this order');
        }

        order.status = status || order.status;
        
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
};

module.exports = { addOrderItems, getOrderById, getMyOrders, getArtisanOrders, updateOrderStatus };
