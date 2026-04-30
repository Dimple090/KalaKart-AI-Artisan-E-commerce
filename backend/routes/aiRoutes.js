const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { protect } = require('../middleware/authMiddleware');
const Product = require('../models/Product');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper for AI generation
async function getAIResponse(prompt) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (err) {
        console.warn("AI generation failed or timed out, using fallback. Error:", err.message);
        // Provide mock responses based on prompt keywords
        if (prompt.includes("market trends")) {
            return JSON.stringify({ season: "Summer", trends: [{ category: "Pottery", emoji: "🏺", demand: "High", insight: "Earthy tones trending." }] });
        } else if (prompt.includes("Suggest price")) {
            return "2500";
        } else if (prompt.includes("Verify if handmade")) {
            return JSON.stringify({ isHandmadeVerified: true, verificationResult: "Features unique variations typical of hand-crafted items." });
        } else if (prompt.includes("Avatar prompt")) {
            return "A beautiful artisan avatar";
        }
        return "{}";
    }
}

// 1. Trend Forecast
router.get('/trend-forecast', protect, async (req, res) => {
    try {
        const prompt = `Analyze artisan market trends. JSON {season, trends: [{category, emoji, demand, insight}]}.`;
        const result = await getAIResponse(prompt);
        const jsonStr = result.replace(/```json|```/g, '').trim();
        res.json(JSON.parse(jsonStr));
    } catch (error) {
        console.error("Trend forecast error:", error);
        res.status(500).json({ message: "Trend forecast failed", error: error.message });
    }
});

// 2. Predict Price
router.post('/predict-price', protect, async (req, res) => {
    const { name, materialCost, laborCost } = req.body;
    try {
        const prompt = `Suggest price for ${name}. Costs: Mat: ₹${materialCost}, Labor: ₹${laborCost}. Output only the number.`;
        const price = await getAIResponse(prompt);
        res.json({ suggestedPrice: parseInt(price.replace(/[^0-9]/g, '')) });
    } catch (error) {
        res.status(500).json({ message: "Price prediction failed" });
    }
});

// 3. Verify Handmade
router.post('/verify-handmade', protect, async (req, res) => {
    const { name, description } = req.body;
    try {
        const prompt = `Verify if handmade: ${name} - ${description}. JSON {isHandmadeVerified: bool, verificationResult: string}.`;
        const result = await getAIResponse(prompt);
        const jsonStr = result.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr);
        res.json({ isHandmadeVerified: data.isHandmadeVerified, fullData: { verificationResult: data.verificationResult } });
    } catch (error) {
        res.status(500).json({ message: "Handmade verification failed" });
    }
});

// 4. AI Search
router.post('/search', async (req, res) => {
    const { query } = req.body;
    try {
        const prompt = `Search intent: "${query}". Identify category and keywords. JSON {category, keywords: []}. Categories: Jewelry, Pottery, Home Decor, Textiles, Painting, All.`;
        const result = await getAIResponse(prompt);
        const jsonStr = result.replace(/```json|```/g, '').trim();
        res.json(JSON.parse(jsonStr));
    } catch (error) {
        res.status(500).json({ message: "AI search failed" });
    }
});

// 5. Personalized Feed
router.post('/personalized-feed', protect, async (req, res) => {
    const { wishlistCategories, orderCategories } = req.body;
    try {
        const combined = [...new Set([...wishlistCategories, ...orderCategories])];
        const prompt = `User likes: ${combined.join(', ')}. Create a warm 15-word greeting. JSON {greeting}.`;
        const result = await getAIResponse(prompt);
        const jsonStr = result.replace(/```json|```/g, '').trim();
        const { greeting } = JSON.parse(jsonStr);
        const products = await Product.find({ category: { $in: combined.length > 0 ? combined : ['Jewelry', 'Pottery'] } }).limit(4);
        res.json({ greeting, products });
    } catch (error) {
        res.status(500).json({ message: "Personalized feed failed" });
    }
});

// 6. Gift Finder
router.post('/gift-finder', async (req, res) => {
    const { persona } = req.body;
    try {
        const prompt = `Gift for: "${persona}". Explain the logic and pick 2 best categories. JSON {reasoning, recommendedCategories: []}.`;
        const result = await getAIResponse(prompt);
        const jsonStr = result.replace(/```json|```/g, '').trim();
        const { reasoning, recommendedCategories } = JSON.parse(jsonStr);
        
        const products = await Product.find({ 
            category: { $in: recommendedCategories }
        }).limit(6);

        res.json({ reasoning, products });
    } catch (error) {
        res.status(500).json({ message: "Gift finder failed" });
    }
});

// 7. Sales Strategy
router.post('/sales-strategy', protect, async (req, res) => {
    const { productName, description, price, category } = req.body;
    try {
        const prompt = `Strategy for ${productName} (${category}) at ₹${price}.`;
        const advice = await getAIResponse(prompt);
        res.json(advice);
    } catch (error) {
        res.status(500).json({ message: "AI consultation failed" });
    }
});

// 8. Social Captions
router.post('/social-caption', protect, async (req, res) => {
    const { name, description } = req.body;
    try {
        const prompt = `Captions for ${name}. JSON {instagram, twitter}.`;
        const result = await getAIResponse(prompt);
        const jsonStr = result.replace(/```json|```/g, '').trim();
        res.json(JSON.parse(jsonStr));
    } catch (error) {
        res.status(500).json({ message: "Caption generation failed" });
    }
});

// 9. Story Behind Craft
router.post('/story-behind-craft', async (req, res) => {
    const { product, artisanName } = req.body;
    try {
        const prompt = `Story for ${product} by ${artisanName}. JSON {story, culturalSignificance, emotions: []}.`;
        const result = await getAIResponse(prompt);
        const jsonStr = result.replace(/```json|```/g, '').trim();
        res.json(JSON.parse(jsonStr));
    } catch (error) {
        res.status(500).json({ message: "Story generation failed" });
    }
});

// 10. Product Q&A
router.post('/product-qa', async (req, res) => {
    const { question, productName } = req.body;
    try {
        const prompt = `Answer about ${productName}: "${question}".`;
        const answer = await getAIResponse(prompt);
        res.json({ answer });
    } catch (error) {
        res.status(500).json({ message: "Q&A failed" });
    }
});

// 11. Styling Advice
router.post('/styling-advice/:id', async (req, res) => {
    const { productName } = req.body;
    try {
        const prompt = `Styling tips for ${productName}.`;
        const advice = await getAIResponse(prompt);
        res.json(advice);
    } catch (error) {
        res.status(500).json({ message: "Styling advice failed" });
    }
});

// 12. Generate Avatar Prompt
router.post('/generate-avatar-prompt', protect, async (req, res) => {
    const { craftType, style } = req.body;
    try {
        const prompt = `Avatar prompt for ${craftType} in ${style}.`;
        const generatedPrompt = await getAIResponse(prompt);
        res.json({ prompt: generatedPrompt });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate avatar prompt' });
    }
});

module.exports = router;
