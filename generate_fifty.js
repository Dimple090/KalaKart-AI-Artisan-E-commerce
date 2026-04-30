const https = require('https');
const fs = require('fs');
const path = require('path');

const wikiCategories = [
    { title: 'Category:Textiles_of_India', cat_name: 'Textiles' },
    { title: 'Category:Pottery_of_India', cat_name: 'Pottery' },
    { title: 'Category:Handicrafts_of_India', cat_name: 'Home Decor' },
    { title: 'Category:Jewellery_of_India', cat_name: 'Jewelry' },
    { title: 'Category:Wood_carving_of_India', cat_name: 'Art' }
];

const ytVideos = [
    'https://www.youtube.com/embed/3eO5u0PntgA', // Example video URL
    'https://www.youtube.com/embed/_eNNxgA7kQM', 
    'https://www.youtube.com/embed/1B1lG3f9g-8',
    'https://www.youtube.com/embed/Q9R97Jv3jJc',
    'https://www.youtube.com/embed/hB2g7T97yKw'
];

async function fetchWikiImages(wikiCat) {
    return new Promise((resolve) => {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=${wikiCat.title}&gcmtype=file&gcmlimit=15&prop=imageinfo&iiprop=url&format=json`;
        const options = { headers: { 'User-Agent': 'KalaKartSeeder/1.0 (test@example.com)' } };
        
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed.query ? parsed.query.pages : {};
                    const items = Object.values(pages).map(p => {
                        const imageinfo = p.imageinfo ? p.imageinfo[0] : null;
                        if (!imageinfo) return null;
                        return {
                            url: imageinfo.url,
                            cat: wikiCat.cat_name,
                            base: p.title.replace('File:', '').replace('.jpg', '').replace('.png', '').replace(/_/g, ' ')
                        };
                    }).filter(i => i && (i.url.endsWith('.jpg') || i.url.endsWith('.png')));
                    resolve(items);
                } catch (e) { resolve([]); }
            });
        }).on('error', () => resolve([]));
    });
}

async function run() {
    let allItems = [];
    for (const cat of wikiCategories) {
        const items = await fetchWikiImages(cat);
        allItems = allItems.concat(items);
    }

    if (allItems.length < 10) {
        console.error("Failed to fetch enough images.");
        return;
    }

    const products = [];
    // Ensure we build at least 50 if possible, by cycling if needed
    for (let i = 0; i < 50; i++) {
        const item = allItems[i % allItems.length];
        const nextItem = allItems[(i + 1) % allItems.length];
        
        products.push({
            name: `Authentic ${item.cat} - ${item.base.substring(0, 20)}`,
            category: item.cat,
            price: Math.floor(Math.random() * 8000 + 500) + 0.00,
            description: `A stunning, 100% genuine handcrafted piece. ${item.base}. This item showcases the rich cultural heritage and generational craftsmanship.`,
            stock: Math.floor(Math.random() * 15) + 1,
            imageUrl: item.url,
            images: [item.url, nextItem.url],
            videoUrl: ytVideos[i % ytVideos.length],
            isHandmadeVerified: true,
            handmadeAuthenticityScore: Math.floor(Math.random() * 10) + 90,
            sales: Math.floor(Math.random() * 50),
            rating: (Math.random() * 1 + 4).toFixed(1)
        });
    }

    const seedFileContent = `const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

const users = [
    { name: 'Ravi Handicrafts', email: 'artisan@kalakart.com', password: 'password123', role: 'artisan' },
    { name: 'Happy Customer', email: 'buyer@kalakart.com', password: 'password123', role: 'buyer' },
    { name: 'Kavita Pottery', email: 'maya@kalakart.com', password: 'password123', role: 'artisan' },
    { name: 'Ramesh Weavers', email: 'raj@kalakart.com', password: 'password123', role: 'artisan' },
    { name: 'Anjali Jewelry', email: 'priya@kalakart.com', password: 'password123', role: 'artisan' },
    { name: 'Sanjay Brass Decor', email: 'arun@kalakart.com', password: 'password123', role: 'artisan' },
    { name: 'Amit Sharma', email: 'amit@gmail.com', password: 'password123', role: 'buyer' }
];

const products = ${JSON.stringify(products, null, 4).replace(/"([^"]+)":/g, '$1:')};

const generateOrdersAndReviews = async (createdUsers, createdProducts) => {
    const buyer = createdUsers.find(u => u.role === 'buyer');
    const product = createdProducts[0];
    
    if (buyer && product) {
        const order = new Order({
            user: buyer._id,
            orderItems: [{ product: product._id, quantity: 1, price: product.price }],
            shippingAddress: { address: '123 Test St', city: 'Mumbai', postalCode: '400001', country: 'India' },
            paymentMethod: 'Razorpay', isPaid: true, totalPrice: product.price, status: 'Delivered'
        });
        await order.save();
        
        const review = new Review({
            user: buyer._id, product: product._id, rating: 5, comment: "Absolutely beautiful piece! True Indian craft."
        });
        await review.save();
    }
};

const seedData = async () => {
    try {
        await connectDB();
        await User.deleteMany();
        await Product.deleteMany();
        await Order.deleteMany();
        await Review.deleteMany();

        const createdUsers = await User.insertMany(users);
        const productsWithArtisans = products.map((product, idx) => ({
            ...product, artisan: createdUsers[idx % 4]._id
        }));

        const createdProducts = await Product.insertMany(productsWithArtisans);
        await generateOrdersAndReviews(createdUsers, createdProducts);

        console.log('Database successfully seeded with exactly 50 authentic products and YouTube embeds!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
`;

    fs.writeFileSync(path.join(__dirname, 'backend', 'seed.js'), seedFileContent);
    console.log("Written to backend/seed.js!");
}

run();
