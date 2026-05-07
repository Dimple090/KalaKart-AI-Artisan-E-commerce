const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const Product = require('./models/Product');
const User = require('./models/User');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        // 1. Delete "3D Test Vase" products
        const deleteResult = await Product.deleteMany({ name: "3D Test Vase" });
        console.log(`Deleted ${deleteResult.deletedCount} products named '3D Test Vase'`);

        // 2. Find artisan
        const artisan = await User.findOne({ email: 'artisan@kalakart.com' });
        if (!artisan) {
            console.error("Artisan not found!");
            process.exit(1);
        }

        // 3. Create two new handmade jewelry products
        const product1 = new Product({
            name: "Silver Filigree Necklace",
            description: "A meticulously handcrafted silver necklace featuring intricate filigree patterns inspired by traditional motifs.",
            price: 3200,
            category: "Jewelry",
            imageUrl: "https://images.unsplash.com/photo-1599643478524-fb66f7ca12e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            artisan: artisan._id,
            stock: 3,
            isHandmadeVerified: true,
            handmadeAuthenticityScore: 98,
            handmadeReasoning: "Detailed filigree work, unique irregularities characteristic of hand-soldering.",
            transparency: {
                materialCost: 1500,
                laborCost: 1000
            }
        });

        const product2 = new Product({
            name: "Oxidized Silver Jhumkas",
            description: "Beautiful oxidized silver earrings with bell-shaped drops. Perfect for festive occasions or ethnic wear.",
            price: 1800,
            category: "Jewelry",
            imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            artisan: artisan._id,
            stock: 8,
            isHandmadeVerified: true,
            handmadeAuthenticityScore: 95,
            handmadeReasoning: "Traditional casting and finishing techniques evident. Minor asymmetry typical of handmade jewelry.",
            transparency: {
                materialCost: 600,
                laborCost: 800
            }
        });

        await product1.save();
        await product2.save();
        
        console.log("Successfully added 2 handmade jewelry products!");
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
