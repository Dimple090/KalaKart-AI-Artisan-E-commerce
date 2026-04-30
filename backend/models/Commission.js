const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    requestDetails: {
        type: String,
        required: true,
    },
    referenceImage: {
        type: String, // base64 or cloudinary url
    },
    aiEstimate: {
        complexity: { type: String, default: 'Standard' }, // Low, Medium, High
        estimatedDays: { type: Number, default: 7 },
        suggestedPriceRange: { type: String, default: 'Pending Custom Quote' }
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Declined', 'Completed'],
        default: 'Pending',
    },
    finalPrice: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Commission', commissionSchema);
