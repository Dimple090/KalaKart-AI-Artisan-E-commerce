const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Create new review
// @route   POST /api/reviews/:productId
// @access  Private
const createProductReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;

        const product = await Product.findById(productId);

        if (product) {
            // Check if user already reviewed
            const alreadyReviewed = await Review.findOne({
                product: productId,
                user: req.user._id
            });

            if (alreadyReviewed) {
                res.status(400);
                throw new Error('You have already reviewed this product');
            }

            const review = new Review({
                user: req.user._id,
                product: productId,
                rating: Number(rating),
                comment,
            });

            await review.save();

            // Calculate new average rating & count optionally
            const reviews = await Review.find({ product: productId });
            product.numReviews = reviews.length;
            product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
            await product.save();

            res.status(201).json({ message: 'Review added successfully', review });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getProductReviews = async (req, res, next) => {
    try {
        const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name');
        res.json(reviews);
    } catch (error) {
        next(error);
    }
};

module.exports = { createProductReview, getProductReviews };
