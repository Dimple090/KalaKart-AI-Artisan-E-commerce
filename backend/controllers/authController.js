const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Email validation regex
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    try {
        // Input validation
        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please provide all required fields: name, email, password');
        }

        // Email format validation
        if (!validateEmail(email)) {
            res.status(400);
            throw new Error('Please provide a valid email address');
        }

        // Password length validation
        if (password.length < 6) {
            res.status(400);
            throw new Error('Password must be at least 6 characters long');
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'buyer'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
            res.status(400);
            const messages = Object.values(error.errors)
                .map(e => e.message)
                .join(', ');
            error = new Error(messages);
        } else if (error.code === 11000) {
            res.status(400);
            error = new Error('User already exists');
        } else if (error.message.includes("SSL routines")) {
            res.status(500);
            error = new Error("Database Connection Failed (SSL): check your IP Whitelist on MongoDB Atlas.");
        }
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        // Input validation
        if (!email || !password) {
            res.status(400);
            throw new Error('Please provide email and password');
        }

        // Email format validation
        if (!validateEmail(email)) {
            res.status(400);
            throw new Error('Please provide a valid email address');
        }

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        if (error.message.includes("SSL routines")) {
            res.status(500);
            error = new Error("Database Connection Failed (SSL): check your IP Whitelist on MongoDB Atlas.");
        }
        next(error);
    }
};

module.exports = { registerUser, loginUser };
