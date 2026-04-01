require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

const http = require('http');
const app = express();
const server = http.createServer(app);
const initSocket = require('./socket');
const io = initSocket(server);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
// app.use(mongoSanitize());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware (must be after all routes)
app.use(notFound);
app.use(errorHandler);

// Database Connection & Server Start
const startServer = async () => {
    try {
        console.log("Attempting MongoDB Connection...");
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4 // Force IPv4
        });
        console.log('MongoDB Connected');

        // Connection Events
        mongoose.connection.on('connected', () => {
            console.log('Mongoose connected to DB Cluster');
        });

        mongoose.connection.on('error', (err) => {
            console.error('Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected');
        });

    } catch (err) {
        console.error('DB Connection Failed (AI features will still work):', err.message);
    }

    // Always start the Express server even if DB fails
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;
