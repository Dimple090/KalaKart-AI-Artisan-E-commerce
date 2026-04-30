const Product = require('../models/Product');

// @desc    Fetch products by Artisan ID
// @route   GET /api/products/artisan/:id
// @access  Public
const getProductsByArtisan = async (req, res, next) => {
    try {
        const products = await Product.find({ artisan: req.params.id })
            .populate('artisan', 'name profileImage') // Get basic artisan info for cards
            .sort({ createdAt: -1 }); // Newest first
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
    try {
        const products = await Product.find({}).populate('artisan', 'name email');
        res.json(products);
    } catch (error) {
        next(error);
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('artisan', 'name email followers');
        if (product) {
            res.json(product);
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Create a product (Artisan only)
// @route   POST /api/products
// @access  Private (Artisan) - Middleware needed
const createProduct = async (req, res, next) => {
    // imageUrl from body is fallback if no file is provided
    let { name, description, price, category, imageUrl, stock, ecoMaterial, ecoCarbon, ecoRecycling, isHandmadeVerified, handmadeAuthenticityScore, handmadeReasoning, handmadeKeyObservations, materialCost, laborCost, videoUrl, modelUrl } = req.body;

    // If multer processed a file, use the Cloudinary URL
    if (req.file) {
        imageUrl = req.file.path;
    }

    try {
        const product = new Product({
            name,
            description,
            price,
            category,
            imageUrl,
            artisan: req.user._id, // Got from protect middleware
            stock,
            ecoScore: {
                material: Number(ecoMaterial) || 0,
                carbon: Number(ecoCarbon) || 0,
                recycling: Number(ecoRecycling) || 0
            },
            transparency: {
                materialCost: Number(materialCost) || 0,
                laborCost: Number(laborCost) || 0
            },
            // Verification fields are stored if provided (e.g. from String 'true' if via FormData)
            isHandmadeVerified: isHandmadeVerified === 'true' || isHandmadeVerified === true,
            handmadeAuthenticityScore: Number(handmadeAuthenticityScore) || 0,
            handmadeReasoning: handmadeReasoning || '',
            handmadeKeyObservations: handmadeKeyObservations ? JSON.parse(handmadeKeyObservations) : [],
            videoUrl: videoUrl || '',
            modelUrl: modelUrl || ''
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error("PRODUCT CREATION ERROR:", error);
        next(error);
    }
};

const { GoogleGenerativeAI } = require('@google/generative-ai');

// @desc    Generate AI Description
// @route   POST /api/products/generate-description
// @access  Private (Artisan)
const generateDescription = async (req, res, next) => {
    try {
        const { productName, category, keywords } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a professional copywriter for KalaKart, a marketplace for premium handmade artisan crafts.
        Generate a compelling, descriptive, and poetic product description for:
        Product Name: ${productName}
        Category: ${category}
        Inspiration/Keywords: ${keywords}
        
        The description should be 2-3 sentences long and sound authentic compared to factory-made products.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiDescription = response.text().trim();

        res.json({ description: aiDescription });
    } catch (error) {
        console.error("Gemini API Error:", error.message);
        // Fallback if AI fails or key is missing
        const fallback = `(AI Generated) A beautiful handcrafted ${req.body.productName} perfect for ${req.body.category}. Made with care and featuring elements of ${req.body.keywords}. High quality and unique.`;
        res.json({ description: fallback });
    }
};

// @desc    Delete a product (Owner only)
// @route   DELETE /api/products/:id
// @access  Private (Artisan)
const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        // Check if the user is the owner
        if (product.artisan.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized to delete this product');
        }

        await product.deleteOne();
        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product (Owner only)
// @route   PUT /api/products/:id
// @access  Private (Artisan)
const updateProduct = async (req, res, next) => {
    try {
        const { name, description, price, category, stock, ecoScore, materialCost, laborCost, videoUrl, modelUrl } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        // Check if the user is the owner
        if (product.artisan.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('User not authorized to update this product');
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.stock = stock || product.stock;
        product.videoUrl = videoUrl !== undefined ? videoUrl : product.videoUrl;
        product.modelUrl = modelUrl !== undefined ? modelUrl : product.modelUrl;
        
        if (ecoScore) {
            product.ecoScore = {
                material: Number(ecoScore.material) || product.ecoScore.material,
                carbon: Number(ecoScore.carbon) || product.ecoScore.carbon,
                recycling: Number(ecoScore.recycling) || product.ecoScore.recycling,
            };
        }

        if (materialCost !== undefined || laborCost !== undefined) {
            product.transparency = {
                materialCost: materialCost !== undefined ? Number(materialCost) : product.transparency.materialCost,
                laborCost: laborCost !== undefined ? Number(laborCost) : product.transparency.laborCost
            };
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } catch (error) {
        next(error);
    }
};

// @desc    Like a product
// @route   POST /api/products/:id/like
// @access  Private
const likeProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }
        if (!product.likes.includes(req.user._id)) {
            product.likes.push(req.user._id);
            await product.save();
            res.json(product.likes);
        } else {
            res.status(400);
            throw new Error('Product already liked');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Unlike a product
// @route   POST /api/products/:id/unlike
// @access  Private
const unlikeProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }
        if (product.likes.includes(req.user._id)) {
            product.likes = product.likes.filter(userId => userId.toString() !== req.user._id.toString());
            await product.save();
            res.json(product.likes);
        } else {
            res.status(400);
            throw new Error('Product not liked yet');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Add comment to product
// @route   POST /api/products/:id/comment
// @access  Private
const addComment = async (req, res, next) => {
    try {
        const { text } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }
        const comment = {
            user: req.user._id,
            name: req.user.name,
            text
        };
        product.comments.push(comment);
        await product.save();
        res.status(201).json(product.comments);
    } catch (error) {
        next(error);
    }
};

module.exports = { getProducts, getProductById, getProductsByArtisan, createProduct, deleteProduct, updateProduct, generateDescription, likeProduct, unlikeProduct, addComment };
