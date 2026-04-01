const mongoose = require('mongoose');

const savedIdeaSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    craftName: {
        type: String,
        required: true,
    },
    skillLevel: {
        type: String,
        required: true,
    },
    materialsRequired: {
        type: [String],
        required: true,
    },
    steps: {
        type: [String],
        required: true,
    },
    estimatedTime: {
        type: String,
        required: true,
    },
    creativeTip: {
        type: String,
    },
    sellingIdea: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('SavedIdea', savedIdeaSchema);
