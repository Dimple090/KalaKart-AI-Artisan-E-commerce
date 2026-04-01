const express = require('express');
const { createProductReview, getProductReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware'); // Need to ensure auth exists
const router = express.Router();

router.route('/:productId')
    .get(getProductReviews)
    .post(protect, createProductReview);

module.exports = router;
