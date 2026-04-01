const express = require('express');
const axios = require('axios');
const router = express.Router();
const { protect, artisan } = require('../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const SavedIdea = require('../models/SavedIdea');
const Product = require('../models/Product');

const AI_SERVICE_URL = 'http://localhost:8000';

// Initialize Gemini client (requires GEMINI_API_KEY in .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// @desc    Get dynamic craft tutorials using Gemini
// @route   POST /api/ai/craft-tutorial
// @access  Public
router.post('/craft-tutorial', async (req, res) => {
    try {
        const { materials } = req.body;

        if (!materials || materials.trim() === '') {
            return res.status(400).json({ message: 'Please provide a list of materials.' });
        }

        const prompt = `You are an expert DIY craft instructor specializing in handmade jewelry and eco-friendly crafts.
Generate a creative craft idea and step-by-step tutorial using the following materials (and other easily available items if necessary): ${materials}

You must return ONLY a JSON object (no markdown, no extra text) with the following exact keys and types:
{
  "craftName": "String",
  "skillLevel": "String (Beginner, Intermediate, or Advanced)",
  "materialsRequired": ["Array of Strings"],
  "steps": ["Array of Strings representing step-by-step instructions"],
  "estimatedTime": "String (e.g., '20 minutes')",
  "creativeTip": "String",
  "sellingIdea": "String"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();
        
        // Handle potential markdown formatting from AI
        const cleanJson = generatedText.replace(/```json|```/g, '').trim();
        const jsonResult = JSON.parse(cleanJson);

        res.json(jsonResult);
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        res.status(500).json({ message: "Failed to generate craft tutorial" });
    }
});

// @desc    Get quick craft ideas from a single material
// @route   POST /api/ai/material-finder
// @access  Public
router.post('/material-finder', async (req, res) => {
    try {
        const { material } = req.body;

        if (!material || material.trim() === '') {
            return res.status(400).json({ message: 'Please provide a material.' });
        }

        const prompt = `You are an expert AI craft assistant.
When a user selects a material, suggest creative handmade craft ideas using that material.
Material: ${material}
        
You must return ONLY a JSON array of objects (no markdown, no extra text). Each object must exactly match this format:
{
  "craftName": "String",
  "skillLevel": "String (e.g., Beginner, Intermediate)",
  "description": "String (Short description of the craft)",
  "materialsNeeded": ["Array of Strings"]
}
Limit your response to 3-5 creative and practical craft ideas.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();
        
        const cleanJson = generatedText.replace(/```json|```/g, '').trim();
        const jsonResult = JSON.parse(cleanJson);

        res.json(jsonResult);
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        res.status(500).json({ message: "Failed to generate craft ideas" });
    }
});

// @desc    Get feedback on an artisan's finished craft
// @route   POST /api/ai/craft-feedback
// @access  Public
router.post('/craft-feedback', async (req, res) => {
    try {
        const { creation } = req.body;

        if (!creation || creation.trim() === '') {
            return res.status(400).json({ message: 'Please provide a description of your creation.' });
        }

        const prompt = `You are a supportive and expert craft community assistant for KalaKart.
When a user uploads their handmade craft description, generate supportive feedback, improvement tips, an estimated selling price in Indian Rupees (₹), a category suggestion, and SEO tags.
Creation: ${creation}

You must return ONLY a JSON object (no markdown, no extra text) with the following exact keys and types:
{
  "appreciation": "String (A supportive message about their work)",
  "suggestions": ["Array of Strings (Actionable improvement tips)"],
  "estimatedPrice": "String (e.g., '₹150 - ₹250')",
  "category": "String",
  "tags": ["Array of Strings starting with #"]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();
        
        const cleanJson = generatedText.replace(/```json|```/g, '').trim();
        const jsonResult = JSON.parse(cleanJson);

        res.json(jsonResult);
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        res.status(500).json({ message: "Failed to generate craft feedback" });
    }
});

// @desc    Generate a clear listing description for waste materials
// @route   POST /api/ai/waste-listing
// @access  Public
router.post('/waste-listing', async (req, res) => {
    try {
        const { material, quantity, condition } = req.body;

        if (!material || !quantity || !condition) {
            return res.status(400).json({ message: 'Please provide material, quantity, and condition.' });
        }

        const prompt = `You are an assistant for the KalaKart Waste-to-Art Exchange system.
When a user uploads waste material, generate a clear listing description for artisans.
Material: ${material}
Quantity: ${quantity}
Condition: ${condition}

You must return ONLY a JSON object (no markdown, no extra text) with the following exact keys and types:
{
  "materialName": "String",
  "condition": "String (Description of condition)",
  "quantity": "String (e.g., '20 pieces')",
  "possibleUses": ["Array of Strings (e.g., 'Bottle cap earrings')"],
  "suggestedPrice": "String (e.g., '₹50 - ₹100')",
  "sustainabilityNote": "String (Why this helps the environment)"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();
        
        const cleanJson = generatedText.replace(/```json|```/g, '').trim();
        const jsonResult = JSON.parse(cleanJson);

        res.json(jsonResult);
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        res.status(500).json({ message: "Failed to generate waste listing" });
    }
});

// @desc    Determine whether a product is likely handmade or factory manufactured
// @route   POST /api/ai/verify-handmade
// @access  Public
router.post('/verify-handmade', async (req, res) => {
    try {
        const { product, description } = req.body;

        if (!product || !description) {
            return res.status(400).json({ message: 'Please provide both product name and description.' });
        }

        const prompt = `You are an AI authenticity inspector for the KalaKart platform.
Your job is to analyze handmade craft products and determine whether they are likely handmade or factory manufactured.

Evaluate the following factors based on the details provided:
- Irregularities or imperfections that indicate handmade work
- Material texture and natural variations
- Tool marks or stitching patterns
- Repetition patterns that might indicate machine production
- Craft techniques used by artisans

Product Name: ${product}
Description: ${description}

You must return ONLY a JSON object (no markdown, no extra text) with the following exact keys and types:
{
  "handmadeProbability": "String (High, Medium, or Low)",
  "reasoning": "String (Explain why the product appears handmade or factory-made)",
  "keyObservations": ["Array of Strings (e.g., Natural variation in bead spacing, Visible thread knots)"],
  "verificationResult": "String (Verified Handmade, Possibly Handmade, or Likely Factory Made)",
  "authenticityScore": "Number (0 to 100 representing the confidence score)"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();
        
        const cleanJson = generatedText.replace(/```json|```/g, '').trim();
        const jsonResult = JSON.parse(cleanJson);

        res.json(jsonResult);
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        res.status(500).json({ message: "Failed to perform handmade verification" });
    }
});

// @desc    Generate an emotional story behind a craft
// @route   POST /api/ai/story-behind-craft
// @access  Public
router.post('/story-behind-craft', async (req, res) => {
    try {
        const { product, description, artisanName, artisanLocation } = req.body;

        if (!product || !description) {
            return res.status(400).json({ message: 'Please provide product name and description.' });
        }

        const prompt = `You are a storytelling assistant for the KalaKart handmade marketplace.
Your task is to generate a short emotional story behind a handmade craft product to help buyers connect with the artisan.

When product information is provided, create a short narrative including:
- Artisan Name (Use generic "a talented artisan" if missing)
- Artisan Location (if available)
- Craft technique used
- Materials used
- Cultural or traditional inspiration mentioned

The story should be warm, authentic, and inspiring. Length MUST be EXACTLY 2-4 sentences.

Artisan Name: ${artisanName || 'A talented local artisan'}
Location: ${artisanLocation || 'their studio'}
Product: ${product}
Description: ${description}

You must return ONLY a JSON object (no markdown, no extra text) with the following exact keys and types:
{
  "story": "String (The short 2-4 sentence narrative)",
  "culturalSignificance": "String (A 1-2 sentence explanation of the cultural roots, historical background, or traditional technique of this craft style)",
  "emotions": ["Array of exactly 3 Strings representing the key emotions conveyed, e.g., 'Calm', 'Joy', 'Nostalgia', 'Mystery', 'Warmth'"]
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const generatedText = response.text();
        
        const cleanJson = generatedText.replace(/```json|```/g, '').trim();
        const jsonResult = JSON.parse(cleanJson);

        res.json(jsonResult);
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        res.status(500).json({ message: "Failed to generate craft story" });
    }
});

// @desc    Save an AI generated craft idea
// @route   POST /api/ai/save-idea
// @access  Private
router.post('/save-idea', protect, async (req, res) => {
    try {
        const { craftName, skillLevel, materialsRequired, steps, estimatedTime, creativeTip, sellingIdea } = req.body;

        const savedIdea = new SavedIdea({
            user: req.user._id,
            craftName,
            skillLevel,
            materialsRequired,
            steps,
            estimatedTime,
            creativeTip,
            sellingIdea
        });

        const createdIdea = await savedIdea.save();
        res.status(201).json(createdIdea);
    } catch (error) {
        console.error("Save Idea Error:", error.message);
        res.status(500).json({ message: "Failed to save craft idea" });
    }
});

// @desc    Get logged in user's saved ideas
// @route   GET /api/ai/saved-ideas
// @access  Private
router.get('/saved-ideas', protect, async (req, res) => {
    try {
        const savedIdeas = await SavedIdea.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(savedIdeas);
    } catch (error) {
        console.error("Get Saved Ideas Error:", error.message);
        res.status(500).json({ message: "Failed to fetch saved ideas" });
    }
});

// @desc    Delete a saved idea
// @route   DELETE /api/ai/saved-ideas/:id
// @access  Private
router.delete('/saved-ideas/:id', protect, async (req, res) => {
    try {
        const idea = await SavedIdea.findById(req.params.id);

        if (!idea) {
            return res.status(404).json({ message: 'Idea not found' });
        }

        // Ensure the logged in user is the owner
        if (idea.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to delete this idea' });
        }

        await idea.deleteOne();
        res.json({ message: 'Idea removed' });
    } catch (error) {
        console.error("Delete Saved Idea Error:", error.message);
        res.status(500).json({ message: "Failed to delete saved idea" });
    }
});

// @desc    Get product recommendations
// @route   GET /api/ai/recommendations/:id
// @access  Public
router.get('/recommendations/:id', async (req, res) => {
    try {
        // Find the current product to get its category using Mongoose
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.json({ recommendations: [] });
        }

        // Find up to 3 real products in the same category from the MongoDB database
        // Exclude the current product itself
        const recommendations = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(3);

        res.json({ recommendations });
    } catch (error) {
        console.error("AI Recommendations API Error:", error.message);
        res.status(500).json({ message: "Failed to fetch recommendations" });
    }
});

// @desc    Predict optimal price
// @route   POST /api/ai/predict-price
// @access  Private/Artisan
router.post('/predict-price', protect, artisan, async (req, res) => {
    try {
        const { category, material_cost, labor_hours } = req.body;

        const { data } = await axios.post(`${AI_SERVICE_URL}/api/predict-price`, {
            category,
            material_cost,
            labor_hours
        });

        res.json(data);
    } catch (error) {
        console.error("AI Service Error:", error.message);
        res.status(500).json({ message: "Price prediction unavailable" });
    }
});


// @desc    AI Personal Shopper Chat
// @route   POST /api/ai/chat
// @access  Public
router.post('/chat', async (req, res) => {
    try {
        const { message, history, productId } = req.body;
        
        let contextPrompt = "You are 'Kala', the AI Personal Shopper for KalaKart, a premium artisan marketplace. Be warm, professional, and knowledgeable about handmade crafts.";
        
        if (productId) {
            const product = await Product.findById(productId);
            if (product) {
                contextPrompt += ` 
                Currently, the user is viewing this product:
                - Name: ${product.name}
                - Category: ${product.category}
                - Price: $${product.price}
                - Description: ${product.description}
                - Sustainability: Material: ${product.ecoScore?.material}/10, Carbon: ${product.ecoScore?.carbon}/10, Recycling: ${product.ecoScore?.recycling}/10.
                
                If the user asks about 'this' or 'this item', refer to these details. Try to weave in the story and eco-impact of this specific item.`;
            }
        }

        const systemInstruction = `${contextPrompt}\n\nYour goal is to help users find the perfect handmade products. Be poetic, helpful, and emphasize the value of artisan craftsmanship. Keep your responses concise and engaging.`;

        const result = await model.generateContent(`${systemInstruction}\n\nUser Message: ${message}\nChat History: ${JSON.stringify(history)}`);
        const text = result.response.text();

        res.json({ message: text });
    } catch (error) {
        console.error("AI Chat error:", error);
        res.status(500).json({ message: "My creative circuits are resting. How else can I help you with our artisan collection?" });
    }
});

// @desc    AI Smart Search (Natural Language)
// @route   POST /api/ai/search
// @access  Public
router.post('/search', async (req, res) => {
    try {
        const { query } = req.body;

        const prompt = `You are a shopping assistant for KalaKart, an artisan marketplace. 
        Given the user query: "${query}", extract search keywords and a target category if applicable.
        Response must be JSON format like: {"keywords": ["silver", "rings"], "category": "Jewelry", "intent": "wedding gift"}.
        Common categories: Jewelry, Pottery, Textiles, Home Decor, Painting. 
        Return ONLY the JSON.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        // Basic JSON sanitization in case Gemini wraps in markdown
        const jsonStr = responseText.replace(/```json|```/g, "").trim();
        const searchInsights = JSON.parse(jsonStr);

        res.json(searchInsights);
    } catch (error) {
        console.error("AI Search error:", error);
        res.status(500).json({ message: "Semantic search unavailable" });
    }
});

// @desc    AI Eco-Impact Summary
// @route   POST /api/ai/impact
// @access  Public
router.post('/impact', async (req, res) => {
    try {
        const { scores } = req.body; // { material: 80, carbon: 90, recycling: 70 }
        
        const avg = Object.values(scores).reduce((a, b) => a + b, 0) / 3;

        const prompt = `Based on these sustainability scores: Material Purity: ${scores.material}%, Carbon Neutrality: ${scores.carbon}%, Recyclability: ${scores.recycling}%.
        The average eco-score is ${avg.toFixed(1)}%.
        Write a very short (1-2 sentences), poetic, and encouraging "Impact Receipt" for a buyer. 
        Focus on how their choice to buy handmade is healing the Earth.`;

        const result = await model.generateContent(prompt);
        res.json({ message: result.response.text() });
    } catch (error) {
        console.error("AI Impact error:", error);
        res.status(500).json({ message: "Impact report unavailable" });
    }
});

// @desc    AI Photo Studio Advice (Vision)
// @route   POST /api/ai/photo-tips
// @access  Public
router.post('/photo-tips', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ message: "Image URL required" });

        // Fetch image as base64 for Gemini
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const base64Data = Buffer.from(response.data).toString('base64');

        const prompt = "You are a professional product photographer for a high-end artisan marketplace. Analyze this image and provide exactly 3 concise, professional tips to make it look more premium and sellable (e.g., lighting, composition, background). Return the tips as a simple list.";

        const result = await model.generateContent([
            prompt,
            { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
        ]);

        res.json({ tips: result.response.text() });
    } catch (error) {
        console.error("AI Photo Advice error:", error);
        res.status(500).json({ message: "Photo advice unavailable" });
    }
});

// @desc    AI Live Stream Scripting
// @route   POST /api/ai/live-script
// @access  Private/Artisan
router.post('/live-script', protect, artisan, async (req, res) => {
    try {
        const { productName, description, ecoScore } = req.body;

        const prompt = `You are a professional broadcast producer for KalaKart, a premium artisan marketplace. 
        Write a 2-minute engaging live stream script for an artisan presenting their product: "${productName}".
        Product Description: "${description}".
        Sustainability Scores: Material: ${ecoScore?.material}/10, Carbon: ${ecoScore?.carbon}/10, Recycling: ${ecoScore?.recycling}/10.
        
        The script should include:
        1. An enthusiastic "hook" introduction.
        2. The emotional story behind the craft.
        3. A specific mention of why it's eco-friendly.
        4. A "call to action" to buy now.
        
        Keep it warm, professional, and poetic. Return the script as clear text with [HINT] tags for pauses or actions.`;

        const result = await model.generateContent(prompt);
        res.json({ script: result.response.text() });
    } catch (error) {
        console.error("AI Live Script error:", error);
        res.status(500).json({ message: "Script generation failed" });
    }
});

// @desc    AI Smart Gift Finder
// @route   POST /api/ai/gift-finder
// @access  Public
router.post('/gift-finder', async (req, res) => {
    try {
        const { persona } = req.body;
        if (!persona) return res.status(400).json({ message: "Recipient description required" });

        // Fetch product pool for selection
        const products = await Product.find({}).select('name category price description _id').limit(30);
        const catalogContext = products.map(p => `- ${p.name} ($${p.price}, ${p.category}): ${p.description.substring(0, 100)}... [ID: ${p._id}]`).join('\n');

        const prompt = `You are a high-end luxury gift concierge for KalaKart.
        A user is looking for a gift for: "${persona}".
        
        Our current artisan catalog includes:
        ${catalogContext}
        
        Select the top 3-4 most thoughtful and relevant gifts from our catalog.
        Response must be JSON format: 
        {
          "reasoning": "A poetic 2-sentence explanation of why these gifts were chosen.",
          "matches": ["list of product IDs that match exactly from the catalog"]
        }
        Return ONLY the JSON.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        const jsonStr = responseText.replace(/```json|```/g, "").trim();
        const giftAnalysis = JSON.parse(jsonStr);

        // Fetch full product details for the matches
        const matchedProducts = await Product.find({ _id: { $in: giftAnalysis.matches } });

        res.json({ 
            reasoning: giftAnalysis.reasoning,
            products: matchedProducts 
        });
    } catch (error) {
        console.error("AI Gift Finder error:", error);
        res.status(500).json({ message: "Gift matchmaking service currently offline" });
    }
});

// @desc    AI Sales Strategist for Artisans
// @route   POST /api/ai/sales-strategy
// @access  Private/Artisan
router.post('/sales-strategy', protect, artisan, async (req, res) => {
    try {
        const { productName, description, price, category } = req.body;

        const prompt = `You are a world-class luxury retail consultant specializing in handmade artisan products.
        Analyze this product listing for an artisan on KalaKart:
        - Product Name: "${productName}"
        - Category: "${category}"
        - Price: $${price}
        - Description: "${description}"
        
        Provide 3-4 professional, actionable optimization tips to increase sales and brand value. 
        Focus on:
        1. Narrative/Storytelling: Is the emotional hook strong?
        2. Pricing Strategy: Does the price reflect the artisan value?
        3. Visual Presentation: What specific shot angles or lighting would help?
        4. Technical Keywords: Any missing terms for better search?
        
        Keep your advice encouraging, sophisticated, and concise. 
        Response format: A list of 3-4 items, each with a title and a 2-sentence explanation.`;

        const result = await model.generateContent(prompt);
        res.json({ strategy: result.response.text() });
    } catch (error) {
        console.error("AI Sales Strategist error:", error);
        res.status(500).json({ message: "Consultant is currently in a meeting. Please try again later." });
    }
});

// @desc    Get AI Styling Advice for a product
// @route   POST /api/ai/styling-advice/:id
// @access  Public
router.post('/styling-advice/:id', async (req, res) => {
    try {
        const { productName, description, category, price } = req.body;

        const prompt = `
            You are a high-end luxury personal stylist for 'KalaKart', an artisan marketplace.
            The user is looking at this product:
            Name: ${productName}
            Category: ${category}
            Price: $${price}
            Description: ${description}

            Provide a "Stylist's Tip" (max 60 words) on how to style or pair this item with other artisan treasures (e.g., jewelry, home decor, or specific colors). 
            Be poetic, sophisticated, and persuasive. 
            Suggest 2 specific complementary artisan categories that would go well with this.
            Return JSON format: 
            { 
              "tip": "the poetic advice", 
              "pairings": ["Category 1", "Category 2"] 
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean and parse JSON
        const cleanJson = text.replace(/```json|```/g, '').trim();
        res.json(JSON.parse(cleanJson));

    } catch (error) {
        console.error("AI Styling Advice Error:", error);
        res.status(500).json({ message: "Stylist is busy. Try again later." });
    }
});

// @desc    Get AI Artisan Story/Bio
// @route   POST /api/ai/artisan-story
// @access  Private/Artisan
router.post('/artisan-story', protect, artisan, async (req, res) => {
    try {
        const { name, categories, location } = req.body;

        const prompt = `
            You are a world-class brand storyteller for 'KalaKart', a premium artisan marketplace.
            Write a professional, poetic, and compelling "Craft Story" for an artisan with the following details:
            - Name: ${name}
            - Craft Categories: ${categories.join(', ')}
            - Location: ${location.city}, ${location.state}, ${location.country}

            The story should be 150-200 words long. It should emphasize the connection to heritage, the meticulous nature of the craft, and the artisan's personal passion. 
            Use evocative language (e.g., "whispers of clay," "rhythm of the loom," "heritage in every stitch").
            The tone should be sophisticated, warm, and high-end.
            Return ONLY the story text.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        res.json({ story: text.trim() });
    } catch (error) {
        console.error("AI Artisan Story Error:", error);
        res.status(500).json({ message: "Storyteller is currently lost in thought. Please try again soon." });
    }
});

// @desc    AI Community Review Verdict
// @route   GET /api/ai/review-summary/:id
// @access  Public
router.get('/review-summary/:id', async (req, res) => {
    try {
        const Review = require('../models/Review');
        const reviews = await Review.find({ product: req.params.id }).select('rating comment').limit(20);

        if (!reviews || reviews.length < 2) {
            return res.status(200).json({ verdict: null });
        }

        const reviewText = reviews.map(r => `Rating: ${r.rating}/5 — "${r.comment}"`).join('\n');
        const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

        const prompt = `
            You are an intelligent review analyst for 'KalaKart', a premium artisan marketplace.
            Here are customer reviews for a product (avg rating: ${avgRating}/5):
            ${reviewText}

            Write a short "Community Verdict" in exactly 2 sentences. 
            The first sentence summarizes what customers love most.
            The second sentence mentions one area for improvement if any, or reinforces the praise if all-positive.
            Keep the tone warm, elegant, and concise (under 50 words total).
            Also determine the overall sentiment. 
            Return ONLY this JSON: { "verdict": "...", "sentiment": "positive" | "mixed" | "negative", "avgRating": ${avgRating} }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleanJson = text.replace(/```json|```/g, '').trim();
        res.json(JSON.parse(cleanJson));
    } catch (error) {
        console.error("AI Review Summary error:", error);
        res.status(500).json({ verdict: null });
    }
});

// @desc    AI Style Match - Curated suggestions based on wishlist taste
// @route   POST /api/ai/style-match
// @access  Public
router.post('/style-match', async (req, res) => {
    try {
        const { wishlistItems } = req.body;

        if (!wishlistItems || wishlistItems.length === 0) {
            return res.status(400).json({ message: "Wishlist is empty" });
        }

        // Build a taste profile from wishlist
        const tasteProfile = wishlistItems.map(i => `${i.name} (${i.category}, $${i.price})`).join(', ');

        // Fetch catalog to suggest from
        const catalog = await Product.find({}).select('name category price description _id imageUrl').limit(40);
        const catalogContext = catalog
            .filter(p => !wishlistItems.find(w => w._id === String(p._id)))
            .map(p => `- ${p.name} ($${p.price}, ${p.category}) [ID: ${p._id}]`)
            .join('\n');

        const prompt = `
            You are a luxury personal stylist for KalaKart, an artisan marketplace.
            A buyer's wishlist contains: ${tasteProfile}.
            
            Based on this taste profile, identify a 2-4 word style label (e.g., "Bohemian Minimalist", "Earthy Luxe", "Modern Heritage") that describes their aesthetic.
            Then from this catalog, pick 3 products that perfectly complement their taste:
            ${catalogContext}

            Return ONLY JSON: { "styleLabel": "...", "matches": ["productId1", "productId2", "productId3"] }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        const matchedProducts = await Product.find({ _id: { $in: parsed.matches } });

        res.json({ styleLabel: parsed.styleLabel, products: matchedProducts });
    } catch (error) {
        console.error("AI Style Match error:", error);
        res.status(500).json({ message: "Style curator is unavailable. Please try again." });
    }
});

// @desc    AI Cart Bundle Advisor — "Complete the Collection"
// @route   POST /api/ai/bundle-advisor
// @access  Public
router.post('/bundle-advisor', async (req, res) => {
    try {
        const { cartItems } = req.body;
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const cartContext = cartItems.map(i => `${i.name} (${i.category})`).join(', ');
        const cartIds = cartItems.map(i => String(i._id));

        // Fetch catalog excluding items already in cart
        const catalog = await Product.find({ _id: { $nin: cartIds } })
            .select('name category price _id imageUrl description')
            .limit(30);

        if (catalog.length === 0) return res.json({ bundles: [], reason: '' });

        const catalogContext = catalog.map(p =>
            `- ${p.name} ($${p.price}, ${p.category}) [ID: ${p._id}]`
        ).join('\n');

        const prompt = `
            You are a luxury bundle curator for KalaKart, a handmade artisan marketplace.
            A buyer's cart contains: ${cartContext}.

            From this catalog, pick exactly 2 products that would naturally complement what's already in the cart:
            ${catalogContext}

            Also write a short 1-sentence "reason" (max 15 words) explaining why these items complete the set.
            Return ONLY JSON: { "reason": "...", "matches": ["productId1", "productId2"] }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        const bundles = await Product.find({ _id: { $in: parsed.matches } });
        res.json({ bundles, reason: parsed.reason });
    } catch (error) {
        console.error("AI Bundle Advisor error:", error);
        res.status(500).json({ bundles: [], reason: '' });
    }
});

// @desc    AI Order Intelligence — Personalised delivery insight
// @route   POST /api/ai/order-insight
// @access  Public
router.post('/order-insight', async (req, res) => {
    try {
        const { items, status, city, country, orderDate } = req.body;

        const itemsList = items.map(i => `${i.name} (x${i.qty})`).join(', ');
        const daysSinceOrder = Math.floor((Date.now() - new Date(orderDate)) / (1000 * 60 * 60 * 24));

        const prompt = `
            You are a thoughtful delivery concierge for KalaKart, a premium handmade artisan marketplace.
            An order was placed ${daysSinceOrder} day(s) ago. Status: "${status}".
            Items: ${itemsList}.
            Shipping to: ${city}, ${country}.

            Write a warm, professional 2-sentence "What to Expect" message for the buyer.
            Sentence 1: A reassuring note about the artisan carefully preparing their items.
            Sentence 2: An estimated delivery window (e.g., "Expect your treasure in 3-5 days") and a warm sign-off.
            Also provide an estimated delivery range as "etaDays": "3-5 days".
            Return ONLY JSON: { "message": "...", "etaDays": "..." }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleanJson = text.replace(/```json|```/g, '').trim();
        res.json(JSON.parse(cleanJson));
    } catch (error) {
        console.error("AI Order Insight error:", error);
        res.status(500).json({ message: null });
    }
});

// @desc    AI Personalized Home Feed
// @route   POST /api/ai/personalized-feed
// @access  Private
router.post('/personalized-feed', protect, async (req, res) => {
    try {
        const { wishlistCategories, orderCategories } = req.body;

        const allCategories = [...new Set([...wishlistCategories, ...orderCategories])];
        if (allCategories.length === 0) {
            return res.json({ greeting: null, products: [] });
        }

        // Fetch catalog products matching known interests
        const catalog = await Product.find({ category: { $in: allCategories } })
            .select('name category price _id imageUrl description')
            .limit(20);

        if (catalog.length === 0) return res.json({ greeting: null, products: [] });

        const catalogContext = catalog
            .map(p => `- ${p.name} ($${p.price}, ${p.category}) [ID: ${p._id}]`)
            .join('\n');

        const prompt = `
            You are a personal curator for KalaKart, a luxury artisan marketplace.
            A buyer loves these categories: ${allCategories.join(', ')}.
            
            From this catalog, pick the 4 most exciting products for them:
            ${catalogContext}

            Also write a short, warm 1-sentence personalized greeting (mention their taste, e.g., "You have a passion for handcrafted Jewelry and Pottery...").
            Return ONLY JSON: { "greeting": "...", "picks": ["id1", "id2", "id3", "id4"] }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleanJson = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        const products = await Product.find({ _id: { $in: parsed.picks } });
        res.json({ greeting: parsed.greeting, products });
    } catch (error) {
        console.error("AI Personalized Feed error:", error);
        res.status(500).json({ greeting: null, products: [] });
    }
});

// @desc    AI Market Trend Forecaster — seasonal craft demand insights
// @route   GET /api/ai/trend-forecast
// @access  Private/Artisan
router.get('/trend-forecast', protect, artisan, async (req, res) => {
    try {
        const now = new Date();
        const month = now.toLocaleString('en-IN', { month: 'long' });
        const season = now.getMonth() >= 2 && now.getMonth() <= 4 ? 'Spring' :
                       now.getMonth() >= 5 && now.getMonth() <= 7 ? 'Summer' :
                       now.getMonth() >= 8 && now.getMonth() <= 10 ? 'Festive/Autumn' : 'Winter/Holiday';

        const prompt = `
            You are a market intelligence analyst for KalaKart, a premium Indian artisan marketplace.
            It is currently ${month} (${season} season).

            Predict the top 3 trending craft product categories for this season in India.
            For each, give:
            - "category": the craft category name
            - "demand": "High" | "Medium" | "Growing"  
            - "insight": 1 sentence on WHY it's trending (e.g., festivals, gifting season, home decor trends)
            - "emoji": a single relevant emoji

            Return ONLY JSON: { "season": "${season}", "trends": [ { category, demand, insight, emoji }, ... ] }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleanJson = text.replace(/```json|```/g, '').trim();
        res.json(JSON.parse(cleanJson));
    } catch (error) {
        console.error("Trend forecast error:", error);
        res.status(500).json({ season: '', trends: [] });
    }
});

// @desc    AI Social Caption Generator
// @route   POST /api/ai/social-caption
// @access  Private/Artisan
router.post('/social-caption', protect, artisan, async (req, res) => {
    try {
        const { productName, description, category, price } = req.body;
        const prompt = `
            You are a social media marketing expert for KalaKart, a premium Indian artisan marketplace.
            Generate engaging social media captions for this handmade product:
            - Product: ${productName}
            - Category: ${category}
            - Price: $${price}
            - Description: ${description}

            Write two captions:
            1. "instagram": A vibrant, emoji-rich 2-3 sentence caption ending with 8-10 relevant hashtags.
            2. "twitter": A punchy, witty single sentence under 240 characters with 2-3 hashtags.

            Return ONLY JSON: { "instagram": "...", "twitter": "..." }
        `;
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        res.json(JSON.parse(text.replace(/```json|```/g, '').trim()));
    } catch (error) {
        console.error("AI Social Caption error:", error);
        res.status(500).json({ instagram: null, twitter: null });
    }
});

// @desc    AI Product Q&A Assistant
// @route   POST /api/ai/product-qa
// @access  Public
router.post('/product-qa', async (req, res) => {
    try {
        const { question, productName, description, category, price } = req.body;
        if (!question?.trim()) return res.status(400).json({ answer: null });

        const prompt = `
            You are a knowledgeable artisan advisor for KalaKart, a premium Indian handmade marketplace.
            A buyer is viewing this product:
            - Name: ${productName}
            - Category: ${category}
            - Price: $${price}
            - Description: ${description}

            Buyer question: "${question}"

            Answer in 2-3 concise, friendly, expert sentences. Focus on giving real buying advice (materials, care, gifting, sizing, customisation). Do not make up false claims.
            Return ONLY JSON: { "answer": "..." }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        res.json(JSON.parse(text.replace(/```json|```/g, '').trim()));
    } catch (error) {
        console.error("AI Product Q&A error:", error);
        res.status(500).json({ answer: "Our AI advisor is currently unavailable. Please contact the artisan directly." });
    }
});

// @desc    AI Product Name Generator
// @route   POST /api/ai/product-name
// @access  Private/Artisan
router.post('/product-name', protect, artisan, async (req, res) => {
    try {
        const { category, description } = req.body;
        if (!category) return res.status(400).json({ suggestions: [] });

        const prompt = `
            You are a luxury brand naming expert for KalaKart, a premium Indian handmade marketplace.
            Generate 5 catchy, sophisticated, and evocative names for a product in the "${category}" category.
            Product Description/Keywords: "${description || 'handcrafted treasure'}".
            
            The names should sound expensive, authentic, and culturally rich.
            Return ONLY JSON: { "suggestions": ["Name 1", "Name 2", "Name 3", "Name 4", "Name 5"] }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        res.json(JSON.parse(text.replace(/```json|```/g, '').trim()));
    } catch (error) {
        console.error("AI Product Name error:", error);
        res.status(500).json({ suggestions: [] });
    }
});

module.exports = router;
