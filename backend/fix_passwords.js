const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const fixPasswords = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        for (let user of users) {
            console.log(`Resetting and hashing password for ${user.email}...`);
            user.password = 'password123';
            await user.save();
        }
        console.log('Done fixing passwords!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

fixPasswords();
