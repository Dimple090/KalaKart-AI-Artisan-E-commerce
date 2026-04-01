const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    console.log(`[AUTH DEBUG] Protect hit for ${req.originalUrl}`);

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log(`[AUTH DEBUG] Extracted Token: ${token.substring(0, 15)}...`);

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log(`[AUTH DEBUG] Token Verified. Decoded ID: ${decoded.id}`);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                console.error(`[AUTH DEBUG] DB User not found for ID: ${decoded.id}`);
                res.status(401);
                return next(new Error('User not found in database. Please login again.'));
            }

            console.log(`[AUTH DEBUG] Authentic User Found: ${req.user.email}`);
            next();
        } catch (error) {
            console.error('[AUTH DEBUG] Catch Block Error:', error);
            res.status(401);
            return next(new Error('Not authorized, token failed'));
        }
    }

    if (!token) {
        console.error(`[AUTH DEBUG] No token provided in headers!`);
        res.status(401);
        return next(new Error('Not authorized, no token'));
    }
};

const artisan = (req, res, next) => {
    if (req.user && req.user.role === 'artisan') {
        next();
    } else {
        res.status(401);
        return next(new Error('Not authorized as an artisan'));
    }
};

module.exports = { protect, artisan };
