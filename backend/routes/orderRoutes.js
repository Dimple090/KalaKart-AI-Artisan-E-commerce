const express = require('express');
const { addOrderItems, getOrderById, getMyOrders, getArtisanOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, addOrderItems);
router.route('/myorders').get(protect, getMyOrders);
router.route('/artisan').get(protect, getArtisanOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, updateOrderStatus);

module.exports = router;
