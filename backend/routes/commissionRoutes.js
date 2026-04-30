const express = require('express');
const router = express.Router();
const { protect, artisan } = require('../middleware/authMiddleware');
const Commission = require('../models/Commission');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const aiModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// @desc    Create a new custom commission request (with AI estimation)
// @route   POST /api/commissions
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { artisanId, requestDetails, referenceImage } = req.body;

        if (!artisanId || !requestDetails) {
            return res.status(400).json({ message: "Artisan ID and details required" });
        }

        // Call Gemini to estimate complexity and timeframe
        let complexityStr = "Standard";
        let daysStr = 7;
        let priceStr = "Pending Quote";

        try {
            const prompt = `
                You are a master artisan consultant in India evaluating a custom order request for KalaKart.
                Request: "${requestDetails}"
                Analyze the request and return ONLY JSON with the following fields:
                - "complexity": "Low", "Medium", or "High"
                - "estimatedDays": An integer representing roughly how many days it might take (be realistic for handmade work)
                - "suggestedPriceRange": A string range in Indian Rupees (₹), e.g., "₹5000 - ₹8000"
            `;
            
            let result;
            if (referenceImage && referenceImage.startsWith('data:image')) {
                const base64Data = referenceImage.replace(/^data:image\/\w+;base64,/, "");
                result = await aiModel.generateContent([
                    prompt,
                    { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
                ]);
            } else {
                result = await aiModel.generateContent(prompt);
            }

            const cleanJson = result.response.text().replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            
            complexityStr = parsed.complexity || "Medium";
            daysStr = parsed.estimatedDays || 7;
            priceStr = parsed.suggestedPriceRange || "Custom";
        } catch (aiError) {
            console.error("Commission AI Error:", aiError);
            // Non-fatal, we'll just use the defaults
        }

        const commission = new Commission({
            buyer: req.user._id,
            artisan: artisanId,
            requestDetails,
            referenceImage: referenceImage || '',
            aiEstimate: {
                complexity: complexityStr,
                estimatedDays: daysStr,
                suggestedPriceRange: priceStr
            }
        });

        await commission.save();
        res.status(201).json(commission);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc    Get user's commission requests (buyer)
// @route   GET /api/commissions/my-requests
// @access  Private
router.get('/my-requests', protect, async (req, res) => {
    try {
        const commissions = await Commission.find({ buyer: req.user._id }).populate('artisan', 'name');
        res.json(commissions);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc    Get commissions for artisan
// @route   GET /api/commissions/artisan
// @access  Private (Artisan only)
router.get('/artisan', protect, artisan, async (req, res) => {
    try {
        const commissions = await Commission.find({ artisan: req.user._id }).populate('buyer', 'name email');
        res.json(commissions);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

// @desc    Update commission status and price
// @route   PUT /api/commissions/:id/status
// @access  Private (Artisan only)
router.put('/:id/status', protect, artisan, async (req, res) => {
    try {
        const commission = await Commission.findById(req.params.id);
        
        if (!commission) {
            return res.status(404).json({ message: "Commission not found" });
        }
        
        if (commission.artisan.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        commission.status = req.body.status || commission.status;
        if (req.body.finalPrice) {
            commission.finalPrice = req.body.finalPrice;
        }

        const updatedCommission = await commission.save();
        res.json(updatedCommission);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
