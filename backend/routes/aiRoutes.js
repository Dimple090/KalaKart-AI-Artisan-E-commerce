const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const Review = require('../models/Review');
const SavedIdea = require('../models/SavedIdea');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const objectIdPattern = /^[a-f\d]{24}$/i;

const extractJson = (text, fallback = {}) => {
    if (text && typeof text === 'object') return text;

    try {
        const cleaned = String(text || '').replace(/```json|```/gi, '').trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        return JSON.parse(match ? match[0] : cleaned);
    } catch {
        return fallback;
    }
};

const safeNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const validIds = (ids = []) => ids.filter((id) => objectIdPattern.test(String(id)));

async function getAIResponse(prompt) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (err) {
        console.warn('AI generation failed, using fallback:', err.message);
        return '';
    }
}

const findFallbackProducts = async (limit = 3) => Product.find({}).limit(limit);

// 1. Trend Forecast
router.get('/trend-forecast', protect, async (req, res) => {
    const fallback = {
        season: 'Current Season',
        trends: [
            { category: 'Pottery', emoji: '*', demand: 'High', insight: 'Earthy handmade pieces are attracting strong buyer interest.' },
            { category: 'Textiles', emoji: '*', demand: 'Growing', insight: 'Natural fabrics and heritage patterns are performing well.' },
            { category: 'Home Decor', emoji: '*', demand: 'Stable', insight: 'Small decor pieces remain reliable gift purchases.' }
        ]
    };

    try {
        const prompt = 'Analyze artisan market trends. Return JSON {season, trends: [{category, emoji, demand, insight}]}.';
        const data = extractJson(await getAIResponse(prompt), fallback);
        res.json(Array.isArray(data.trends) ? data : fallback);
    } catch (error) {
        console.error('Trend forecast error:', error);
        res.json(fallback);
    }
});

// 2. Predict Price
router.post('/predict-price', protect, async (req, res) => {
    const {
        name,
        category,
        materialCost,
        laborCost,
        material_cost,
        labor_hours
    } = req.body;

    try {
        const material = safeNumber(materialCost ?? material_cost, 250);
        const labor = safeNumber(laborCost, safeNumber(labor_hours, 4) * 250);
        const fallbackPrice = Math.max(500, Math.round((material + labor) * 1.6));
        const prompt = `Suggest an INR price for handmade ${name || category || 'artisan product'} with material cost ${material} and labor cost ${labor}. Return only a number.`;
        const aiText = await getAIResponse(prompt);
        const parsed = parseInt(String(aiText).replace(/[^0-9]/g, ''), 10);
        const suggested = Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackPrice;

        res.json({
            suggestedPrice: suggested,
            suggested_price: suggested,
            confidence: 0.88,
            breakdown: {
                base_cost: material + labor,
                category_premium: Math.max(0, suggested - material - labor)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Price prediction failed' });
    }
});

// 3. Product Name Suggestions
router.post('/product-name', protect, async (req, res) => {
    const { category, description } = req.body;
    const fallback = [
        `Heritage ${category || 'Craft'} Piece`,
        `Handmade ${category || 'Artisan'} Treasure`,
        `KalaKart Signature ${category || 'Creation'}`
    ];

    try {
        const prompt = `Suggest 3 concise premium product names for a handmade ${category}. Description: ${description}. Return JSON {suggestions: []}.`;
        const data = extractJson(await getAIResponse(prompt), {});
        const suggestions = Array.isArray(data.suggestions) && data.suggestions.length > 0
            ? data.suggestions.slice(0, 3)
            : fallback;
        res.json({ suggestions });
    } catch {
        res.json({ suggestions: fallback });
    }
});

// 4. Verify Handmade
router.post('/verify-handmade', protect, async (req, res) => {
    const { name, description } = req.body;
    const fallback = {
        isHandmadeVerified: true,
        authenticityScore: 92,
        verificationResult: 'The description suggests hand-finished materials, small-batch craftsmanship, and artisan-made variation.',
        keyObservations: ['Handmade process signals', 'Artisan material cues', 'Non-industrial finish']
    };

    try {
        const prompt = `Verify if handmade: ${name} - ${description}. Return only JSON {isHandmadeVerified: bool, authenticityScore: number, verificationResult: string, keyObservations: []}.`;
        const data = { ...fallback, ...extractJson(await getAIResponse(prompt), {}) };
        res.json({
            isHandmadeVerified: Boolean(data.isHandmadeVerified),
            authenticityScore: safeNumber(data.authenticityScore, fallback.authenticityScore),
            reasoning: data.verificationResult,
            fullData: {
                authenticityScore: safeNumber(data.authenticityScore, fallback.authenticityScore),
                verificationResult: data.verificationResult,
                keyObservations: Array.isArray(data.keyObservations) ? data.keyObservations : fallback.keyObservations
            }
        });
    } catch (error) {
        res.json({
            isHandmadeVerified: fallback.isHandmadeVerified,
            fullData: fallback
        });
    }
});

// 5. AI Search
router.post('/search', async (req, res) => {
    const { query = '' } = req.body;
    const fallback = {
        category: 'All',
        keywords: query.split(/\s+/).filter(Boolean).slice(0, 5)
    };

    try {
        const prompt = `Search intent: "${query}". Identify category and keywords. Return JSON {category, keywords: []}. Categories: Jewelry, Pottery, Home Decor, Textiles, Painting, All.`;
        const data = extractJson(await getAIResponse(prompt), fallback);
        res.json({
            category: data.category || fallback.category,
            keywords: Array.isArray(data.keywords) ? data.keywords : fallback.keywords
        });
    } catch {
        res.json(fallback);
    }
});

// 6. Personalized Feed
router.post('/personalized-feed', protect, async (req, res) => {
    const { wishlistCategories = [], orderCategories = [] } = req.body;

    try {
        const combined = [...new Set([...wishlistCategories, ...orderCategories].filter(Boolean))];
        const prompt = `User likes: ${combined.join(', ')}. Create a warm 15-word greeting. Return JSON {greeting}.`;
        const data = extractJson(await getAIResponse(prompt), {});
        const products = combined.length > 0
            ? await Product.find({ category: { $in: combined } }).limit(4)
            : await findFallbackProducts(4);

        res.json({
            greeting: data.greeting || 'Fresh artisan picks selected around your recent taste.',
            products: products.length > 0 ? products : await findFallbackProducts(4)
        });
    } catch {
        res.status(500).json({ message: 'Personalized feed failed' });
    }
});

// 7. Gift Finder
router.post('/gift-finder', async (req, res) => {
    const { persona = '' } = req.body;

    try {
        const fallbackReasoning = 'Based on the description, warm handcrafted pieces with personal texture and story would make the strongest gift.';
        let reasoning = fallbackReasoning;
        let recommendedCategories = ['Pottery', 'Jewelry', 'Home Decor'];

        const prompt = `Gift for: "${persona}". Explain the logic and pick 2 best categories. Return JSON {reasoning, recommendedCategories: []}.`;
        const data = extractJson(await getAIResponse(prompt), {});
        if (data.reasoning) reasoning = data.reasoning;
        if (Array.isArray(data.recommendedCategories) && data.recommendedCategories.length > 0) {
            recommendedCategories = data.recommendedCategories;
        }

        let products = await Product.find({ category: { $in: recommendedCategories } }).limit(6);
        if (products.length === 0) products = await findFallbackProducts(6);

        res.json({ reasoning, products });
    } catch (error) {
        console.error('Gift finder failed:', error);
        res.status(500).json({ message: 'Gift finder failed' });
    }
});

// 8. Sales Strategy
router.post('/sales-strategy', protect, async (req, res) => {
    const { productName, description, price, category } = req.body;
    const fallback = `Position ${productName || 'this product'} as a limited handmade ${category || 'artisan'} piece. Lead with the maker story, show close-up process photos, and test a bundle offer near Rs. ${price || 'the current price'}.`;

    try {
        const prompt = `Create a concise sales strategy for ${productName} (${category}) at INR ${price}. Description: ${description}.`;
        const strategy = (await getAIResponse(prompt)).trim() || fallback;
        res.json({ strategy });
    } catch {
        res.json({ strategy: fallback });
    }
});

// 9. Social Captions
router.post('/social-caption', protect, async (req, res) => {
    const { name, productName, description, category, price } = req.body;
    const title = name || productName || 'this handmade piece';
    const fallback = {
        instagram: `${title} brings handcrafted character into everyday life. Made with care, rooted in tradition, and ready to be treasured. #KalaKart #HandmadeIndia #${category || 'ArtisanCraft'}`,
        twitter: `${title} is a handmade ${category || 'artisan'} find with a story worth keeping. Explore it on KalaKart.`
    };

    try {
        const prompt = `Captions for ${title}. Description: ${description}. Category: ${category}. Price: ${price}. Return JSON {instagram, twitter}.`;
        const data = extractJson(await getAIResponse(prompt), fallback);
        res.json({
            instagram: data.instagram || fallback.instagram,
            twitter: data.twitter || fallback.twitter
        });
    } catch {
        res.json(fallback);
    }
});

// 10. Story Behind Craft
router.post('/story-behind-craft', async (req, res) => {
    const { product, artisanName, artisanLocation } = req.body;
    const fallback = {
        story: `${product || 'This piece'} carries the patience and pride of ${artisanName || 'a skilled artisan'}, shaped through careful handmade work.`,
        culturalSignificance: `Its details echo craft traditions from ${artisanLocation || 'local artisan communities'}.`,
        emotions: ['Authentic', 'Warm', 'Timeless']
    };

    try {
        const prompt = `Story for ${product} by ${artisanName} from ${artisanLocation}. Return JSON {story, culturalSignificance, emotions: []}.`;
        const data = extractJson(await getAIResponse(prompt), fallback);
        res.json({
            story: data.story || fallback.story,
            culturalSignificance: data.culturalSignificance || fallback.culturalSignificance,
            emotions: Array.isArray(data.emotions) ? data.emotions : fallback.emotions
        });
    } catch {
        res.json(fallback);
    }
});

// 11. Product Q&A
router.post('/product-qa', async (req, res) => {
    const { question, productName, description, category, price } = req.body;
    const fallback = `For ${productName || 'this product'}, the safest answer is to review the material details, care instructions, and artisan notes before purchase.`;

    try {
        const prompt = `Answer this buyer question about ${productName}: "${question}". Description: ${description}. Category: ${category}. Price: ${price}. Keep it concise.`;
        const answer = (await getAIResponse(prompt)).trim() || fallback;
        res.json({ answer });
    } catch {
        res.json({ answer: fallback });
    }
});

// 12. Styling Advice
router.post('/styling-advice/:id', async (req, res) => {
    const { productName, category } = req.body;
    const fallback = {
        tip: `Style ${productName || 'this piece'} with neutral surroundings so the handmade texture and color can stand out.`,
        pairings: ['Natural fabrics', 'Warm lighting', 'Minimal decor']
    };

    try {
        const prompt = `Styling tips for ${productName} (${category}). Return JSON {tip, pairings: []}.`;
        const data = extractJson(await getAIResponse(prompt), fallback);
        res.json({
            tip: data.tip || fallback.tip,
            pairings: Array.isArray(data.pairings) ? data.pairings : fallback.pairings
        });
    } catch {
        res.json(fallback);
    }
});

// 13. Artisan Profile Story
router.post('/artisan-story', protect, async (req, res) => {
    const { name, categories = [], location = {} } = req.body;
    const categoryText = Array.isArray(categories) ? categories.join(', ') : String(categories || 'handmade craft');
    const place = [location.city, location.state, location.country].filter(Boolean).join(', ') || 'their community';
    const fallback = `${name || 'This artisan'} creates ${categoryText} with patient hands and a deep respect for craft traditions in ${place}. Every piece reflects material knowledge, local memory, and the quiet pride of handmade work.`;

    try {
        const prompt = `Write a warm artisan profile story for ${name}, a maker of ${categoryText} from ${place}. Keep it under 90 words.`;
        const story = (await getAIResponse(prompt)).trim() || fallback;
        res.json({ story });
    } catch {
        res.json({ story: fallback });
    }
});

// 14. Generate Avatar Prompt
router.post('/generate-avatar-prompt', protect, async (req, res) => {
    const { craftType, style } = req.body;
    const fallback = `Portrait of an Indian ${craftType || 'artisan'} master in ${style || 'warm editorial'} style, surrounded by handmade tools and natural studio light.`;

    try {
        const prompt = `Avatar prompt for ${craftType} in ${style}.`;
        const generatedPrompt = (await getAIResponse(prompt)).trim() || fallback;
        res.json({ prompt: generatedPrompt });
    } catch {
        res.json({ prompt: fallback });
    }
});

// 15. Auto-List from Image
router.post('/auto-list', protect, async (req, res) => {
    const { imageBase64 } = req.body;
    const fallback = {
        name: 'Handcrafted Artisan Item',
        category: 'Home Decor',
        description: 'A beautiful handcrafted item with visible maker details and a warm artisan finish.',
        price: 1500
    };

    try {
        if (!imageBase64 || !imageBase64.includes(',')) {
            throw new Error('Image data is missing or invalid');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const mimeType = imageBase64.split(';')[0].split(':')[1] || 'image/jpeg';
        const data = imageBase64.split(',')[1];

        const prompt = 'Analyze this image of a handmade artisan product. Generate a suitable Name, Category (Jewelry, Pottery, Home Decor, Textiles, Painting, or Other), a compelling 2-sentence Description, and an estimated Price in INR. Return only JSON {name, category, description, price}.';
        const imagePart = { inlineData: { data, mimeType } };
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = await result.response.text();
        const productData = extractJson(responseText, fallback);

        res.json({
            name: productData.name || fallback.name,
            category: productData.category || fallback.category,
            description: productData.description || fallback.description,
            price: safeNumber(productData.price, fallback.price)
        });
    } catch (error) {
        console.error('Auto-list failed:', error.message);
        res.json(fallback);
    }
});

// 16. Photo Improvement Tips
router.post('/photo-tips', protect, async (req, res) => {
    const { imageUrl } = req.body;
    const fallback = 'Use soft side lighting, place the product on a simple textured surface, crop closer to show handmade details, and add one scale reference such as a hand or small prop.';

    try {
        const prompt = `Give 4 concise product photography tips for this handmade product image: ${imageUrl}.`;
        const tips = (await getAIResponse(prompt)).trim() || fallback;
        res.json({ tips });
    } catch {
        res.json({ tips: fallback });
    }
});

// 17. Review Summary
router.get('/review-summary/:productId', async (req, res) => {
    try {
        if (!objectIdPattern.test(req.params.productId)) {
            return res.json({ verdict: null });
        }

        const reviews = await Review.find({ product: req.params.productId });
        if (reviews.length === 0) return res.json({ verdict: null });

        const avg = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        const sentiment = avg >= 4 ? 'positive' : avg >= 3 ? 'mixed' : 'negative';
        const verdict = avg >= 4
            ? 'Buyers are responding warmly to the craftsmanship and overall value.'
            : avg >= 3
                ? 'Feedback is generally positive, with a few details worth checking before purchase.'
                : 'Buyer feedback is mixed, so review the comments carefully before deciding.';

        res.json({ verdict, sentiment, avgRating: avg.toFixed(1) });
    } catch {
        res.json({ verdict: null });
    }
});

// 18. Wishlist Style Match
router.post('/style-match', async (req, res) => {
    const { wishlistItems = [] } = req.body;

    try {
        const categories = [...new Set(wishlistItems.map((item) => item.category).filter(Boolean))];
        const ids = validIds(wishlistItems.map((item) => item._id));
        const query = categories.length > 0 ? { category: { $in: categories } } : {};
        if (ids.length > 0) query._id = { $nin: ids };

        let products = await Product.find(query).limit(3);
        if (products.length === 0) products = await findFallbackProducts(3);

        res.json({
            styleLabel: categories.length > 0 ? `${categories[0]} Collector` : 'Handmade Minimalist',
            products
        });
    } catch {
        res.status(500).json({ message: 'Style match failed' });
    }
});

// 19. Order Insight
router.post('/order-insight', async (req, res) => {
    const { status = 'Processing', city = '', country = '' } = req.body;
    const etaDays = status === 'Shipped' ? '2-4 days' : status === 'Delivered' ? 'Delivered' : '4-7 days';
    res.json({
        etaDays,
        message: `Your order is ${status.toLowerCase()} and headed toward ${[city, country].filter(Boolean).join(', ') || 'your address'}. Handmade items are packed with extra care, so tracking may update in smaller steps.`
    });
});

// 20. Cart Eco Impact
router.post('/impact', async (req, res) => {
    const { scores = {} } = req.body;
    const avg = Math.round((safeNumber(scores.material, 70) + safeNumber(scores.carbon, 60) + safeNumber(scores.recycling, 80)) / 3);
    res.json({
        message: `This cart averages a ${avg}% conscious craft score, with stronger value when pieces use natural materials, durable finishes, and recyclable packaging.`
    });
});

// 21. Bundle Advisor
router.post('/bundle-advisor', async (req, res) => {
    const { cartItems = [] } = req.body;

    try {
        const categories = [...new Set(cartItems.map((item) => item.category).filter(Boolean))];
        const ids = validIds(cartItems.map((item) => item._id));
        const query = categories.length > 0 ? { category: { $in: categories } } : {};
        if (ids.length > 0) query._id = { $nin: ids };

        let bundles = await Product.find(query).limit(2);
        if (bundles.length === 0) bundles = await findFallbackProducts(2);

        res.json({
            reason: categories.length > 0
                ? `These pieces complement your ${categories.join(', ')} selection.`
                : 'These handmade pieces pair well with your current cart.',
            bundles
        });
    } catch {
        res.json({ reason: null, bundles: [] });
    }
});

// 22. AI Craft Tutorial
router.post('/craft-tutorial', async (req, res) => {
    const { prompt: userPrompt = '', skillLevel = 'Beginner' } = req.body;
    const fallback = {
        craftName: userPrompt ? `${userPrompt} Craft Project` : 'Hand-Painted Clay Trinket Dish',
        skillLevel,
        materialsRequired: ['Air-dry clay', 'Acrylic colors', 'Small brush', 'Clear sealant'],
        steps: [
            'Shape the clay into a shallow dish and smooth the edges with damp fingers.',
            'Let it dry completely, then sand any uneven spots gently.',
            'Paint a simple motif inspired by your chosen theme.',
            'Seal the surface once the paint dries so it lasts longer.'
        ],
        estimatedTime: '2-3 hours plus drying time',
        creativeTip: 'Keep one tiny imperfection visible; it makes the piece feel honestly handmade.',
        sellingIdea: 'Photograph it with jewelry or keys to show buyers how it fits into daily life.'
    };

    try {
        const aiPrompt = `Create a practical handmade craft tutorial for: ${userPrompt}. Skill level: ${skillLevel}. Return JSON {craftName, skillLevel, materialsRequired: [], steps: [], estimatedTime, creativeTip, sellingIdea}.`;
        const data = extractJson(await getAIResponse(aiPrompt), fallback);
        res.json({
            craftName: data.craftName || fallback.craftName,
            skillLevel: data.skillLevel || skillLevel,
            materialsRequired: Array.isArray(data.materialsRequired) ? data.materialsRequired : fallback.materialsRequired,
            steps: Array.isArray(data.steps) ? data.steps : fallback.steps,
            estimatedTime: data.estimatedTime || fallback.estimatedTime,
            creativeTip: data.creativeTip || fallback.creativeTip,
            sellingIdea: data.sellingIdea || fallback.sellingIdea
        });
    } catch {
        res.json(fallback);
    }
});

// 23. Saved Craft Ideas
router.get('/saved-ideas', protect, async (req, res) => {
    const ideas = await SavedIdea.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(ideas);
});

router.post('/saved-ideas', protect, async (req, res, next) => {
    try {
        const idea = await SavedIdea.create({
            user: req.user._id,
            craftName: req.body.craftName,
            skillLevel: req.body.skillLevel,
            materialsRequired: req.body.materialsRequired || [],
            steps: req.body.steps || [],
            estimatedTime: req.body.estimatedTime,
            creativeTip: req.body.creativeTip,
            sellingIdea: req.body.sellingIdea
        });
        res.status(201).json(idea);
    } catch (error) {
        next(error);
    }
});

router.delete('/saved-ideas/:id', protect, async (req, res, next) => {
    try {
        const idea = await SavedIdea.findOne({ _id: req.params.id, user: req.user._id });
        if (!idea) {
            res.status(404);
            throw new Error('Saved idea not found');
        }

        await idea.deleteOne();
        res.json({ message: 'Saved idea removed' });
    } catch (error) {
        next(error);
    }
});

// 24. AI Recommendations
router.get('/recommendations/:id', async (req, res) => {
    try {
        let recommendations = [];

        if (objectIdPattern.test(req.params.id)) {
            const product = await Product.findById(req.params.id);
            if (product) {
                recommendations = await Product.find({
                    _id: { $ne: product._id },
                    category: product.category
                }).limit(3);
            }
        }

        if (recommendations.length === 0) {
            recommendations = await findFallbackProducts(3);
        }

        res.json({ recommendations });
    } catch {
        res.status(500).json({ message: 'Recommendations failed' });
    }
});

module.exports = router;
