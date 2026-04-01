const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ email: 'artisan@kalakart.com' });
        console.log("User found:", user ? "Yes" : "No");
        if (user) {
            console.log("Hashed password in DB:", user.password);
            const isMatch = await user.matchPassword('password123');
            console.log("Password match for 'password123':", isMatch);
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkUser();
