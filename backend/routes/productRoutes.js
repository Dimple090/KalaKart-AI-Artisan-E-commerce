const express = require('express');
const { getProducts, getProductById, getProductsByArtisan, createProduct, deleteProduct, updateProduct, generateDescription, likeProduct, unlikeProduct, addComment } = require('../controllers/productController');
const upload = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

const optionalProductImageUpload = (req, res, next) => {
    if (req.is('multipart/form-data')) {
        return upload.single('image')(req, res, next);
    }

    return next();
};

router.route('/').get(getProducts).post(protect, optionalProductImageUpload, createProduct);
router.route('/generate-description').post(generateDescription);
router.route('/artisan/:id').get(getProductsByArtisan);
router.route('/:id').get(getProductById).delete(protect, deleteProduct).put(protect, updateProduct);
router.route('/:id/like').post(protect, likeProduct);
router.route('/:id/unlike').post(protect, unlikeProduct);
router.route('/:id/comment').post(protect, addComment);

module.exports = router;
