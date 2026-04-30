const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    images: [{
        type: String
    }],
    videoUrl: {
        type: String
    },
    modelUrl: {
        type: String
    },
    artisan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    ecoScore: {
        material: { type: Number, default: 0 },
        carbon: { type: Number, default: 0 },
        recycling: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    transparency: {
        materialCost: { type: Number, default: 0 },
        laborCost: { type: Number, default: 0 }
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    rating: {
        type: Number,
        required: true,
        default: 0
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0
    },
    isHandmadeVerified: {
        type: Boolean,
        default: false
    },
    handmadeAuthenticityScore: {
        type: Number,
        default: 0
    },
    handmadeReasoning: {
        type: String,
        default: ''
    },
    handmadeKeyObservations: [{
        type: String
    }]
});

productSchema.pre('save', async function () {
    if (this.ecoScore) {
        this.ecoScore.total = (this.ecoScore.material || 0) + (this.ecoScore.carbon || 0) + (this.ecoScore.recycling || 0);
    }
});

module.exports = mongoose.model('Product', productSchema);
