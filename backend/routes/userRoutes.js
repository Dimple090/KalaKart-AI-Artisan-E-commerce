const express = require('express');
const router = express.Router();
const { followUser, unfollowUser, updateUserProfileImage, updateUserProfile, uploadPortfolioImages, getUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);

// Profile Management Routes
router.put('/profile', protect, updateUserProfile);
router.put('/profile/avatar', protect, updateUserProfileImage);
router.post('/profile/portfolio', protect, upload.array('images', 5), uploadPortfolioImages);
router.get('/:id', getUserProfile);

module.exports = router;
