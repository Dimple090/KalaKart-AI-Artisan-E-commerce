const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Follow a user (Artisan)
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = async (req, res, next) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (userToFollow && currentUser) {
            if (req.params.id === req.user._id.toString()) {
                res.status(400);
                throw new Error("You cannot follow yourself");
            }
            if (!currentUser.following.includes(userToFollow._id)) {
                await currentUser.updateOne({ $push: { following: userToFollow._id } });
                await userToFollow.updateOne({ $push: { followers: currentUser._id } });
                res.status(200).json('User has been followed');
            } else {
                res.status(403).json('You are already following this user');
            }
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
const unfollowUser = async (req, res, next) => {
    try {
        const userToUnfollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (userToUnfollow && currentUser) {
            if (currentUser.following.includes(userToUnfollow._id)) {
                await currentUser.updateOne({ $pull: { following: userToUnfollow._id } });
                await userToUnfollow.updateOne({ $pull: { followers: currentUser._id } });
                res.status(200).json('User has been unfollowed');
            } else {
                res.status(403).json('You are not following this user');
            }
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile image
// @route   PUT /api/users/profile/avatar
// @access  Private
const updateUserProfileImage = async (req, res, next) => {
    try {
        console.log("updateUserProfileImage called for user:", req.user._id);
        const user = await User.findById(req.user._id);

        if (user) {
            console.log("User found, updating profileImage to:", req.body.imageUrl);
            user.profileImage = req.body.imageUrl || user.profileImage;

            console.log("Calling user.save()...");
            const updatedUser = await user.save();
            console.log("Save successful!");

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profileImage: updatedUser.profileImage,
            });
        } else {
            console.log("User not found in DB");
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        console.error("Error in updateUserProfileImage:", error.message, error.stack);
        next(error);
    }
};

// @desc    Update user profile data (bio, location, categories, story, social links)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.location = req.body.location || user.location;
            user.craftCategories = req.body.craftCategories || user.craftCategories;
            user.socialLinks = req.body.socialLinks || user.socialLinks;
            user.craftStory = req.body.craftStory !== undefined ? req.body.craftStory : user.craftStory;

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profileImage: updatedUser.profileImage,
                bio: updatedUser.bio,
                location: updatedUser.location,
                craftCategories: updatedUser.craftCategories,
                socialLinks: updatedUser.socialLinks,
                craftStory: updatedUser.craftStory,
                portfolio: updatedUser.portfolio,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Upload portfolio images (max 5)
// @route   POST /api/users/profile/portfolio
// @access  Private
const uploadPortfolioImages = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Req.files will be populated by multer
            const newImageUrls = req.files.map(file => file.path);

            // Limit to 5 max
            const updatedPortfolio = [...user.portfolio, ...newImageUrls].slice(0, 5);
            user.portfolio = updatedPortfolio;

            await user.save();

            res.json({ portfolio: user.portfolio });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile by ID (Public view)
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -__v -email'); // Don't expose sensitive info publicly

        if (user) {
            const products = await Product.find({ artisan: user._id });
            let totalReviews = 0;
            let totalRatingScore = 0;

            products.forEach(p => {
                totalReviews += p.numReviews || 0;
                totalRatingScore += (p.rating || 0) * (p.numReviews || 0);
            });

            const artisanRating = totalReviews > 0 ? (totalRatingScore / totalReviews).toFixed(1) : 0;

            res.json({
                ...user.toObject(),
                artisanRating: Number(artisanRating),
                totalReviews
            });
        } else {
            res.status(404);
            throw new Error('Profile not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { followUser, unfollowUser, updateUserProfileImage, updateUserProfile, uploadPortfolioImages, getUserProfile };
