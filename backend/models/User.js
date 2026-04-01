const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['buyer', 'artisan', 'admin'],
        default: 'buyer',
    },
    profileImage: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // --- New Profile Edit Fields ---
    bio: {
        type: String,
        maxLength: 200,
        default: '',
    },
    craftCategories: [{
        type: String,
        enum: ['Pottery', 'Handloom', 'Jewelry', 'Bamboo Craft', 'Painting', 'Textile Art', 'Wood Carving', 'Other'],
    }],
    location: {
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        country: { type: String, default: '' },
    },
    portfolio: [{
        type: String, // Array of image URLs (max 5 enforced in controller/UI)
    }],
    socialLinks: {
        instagram: { type: String, default: '' },
        website: { type: String, default: '' },
        youtube: { type: String, default: '' },
    },
    craftStory: {
        type: String,
        default: '',
    }
});

// Password hashing middleware
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
