const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seed.js');

let content = fs.readFileSync(seedPath, 'utf-8');

// Replace users array
const oldUsersSnippetStart = `const users = [
    {
        name: 'Master Artisan',`;
const oldUsersSnippetEnd = `        role: 'buyer'
    }
];`;

const startIdxUser = content.indexOf(oldUsersSnippetStart);
const endIdxUser = content.indexOf(oldUsersSnippetEnd, startIdxUser) + oldUsersSnippetEnd.length;

const newUsersArray = `const users = [
    {
        name: 'Ravi Handicrafts',
        email: 'artisan@kalakart.com',
        password: 'password123',
        role: 'artisan'
    },
    {
        name: 'Happy Customer',
        email: 'buyer@kalakart.com',
        password: 'password123',
        role: 'buyer'
    },
    // Additional artisans
    {
        name: 'Kavita Pottery',
        email: 'maya@kalakart.com',
        password: 'password123',
        role: 'artisan'
    },
    {
        name: 'Ramesh Weavers',
        email: 'raj@kalakart.com',
        password: 'password123',
        role: 'artisan'
    },
    {
        name: 'Anjali Jewelry',
        email: 'priya@kalakart.com',
        password: 'password123',
        role: 'artisan'
    },
    {
        name: 'Sanjay Brass Decor',
        email: 'arun@kalakart.com',
        password: 'password123',
        role: 'artisan'
    },
    {
        name: 'Meera Textiles',
        email: 'kavita@kalakart.com',
        password: 'password123',
        role: 'artisan'
    },
    {
        name: 'Arvind Leather Works',
        email: 'suresh@kalakart.com',
        password: 'password123',
        role: 'artisan'
    },
    // Additional buyers
    {
        name: 'Amit Sharma',
        email: 'amit@gmail.com',
        password: 'password123',
        role: 'buyer'
    },
    {
        name: 'Sneha Patel',
        email: 'sneha@gmail.com',
        password: 'password123',
        role: 'buyer'
    },
    {
        name: 'Vikram Singh',
        email: 'vikram@gmail.com',
        password: 'password123',
        role: 'buyer'
    },
    {
        name: 'Anjali Gupta',
        email: 'anjali@gmail.com',
        password: 'password123',
        role: 'buyer'
    }
];`;

content = content.slice(0, startIdxUser) + newUsersArray + content.slice(endIdxUser);

// Replace products array
const oldProdStart = `const products = [
    // Master Artisan products (14 existing)`;
const oldProdEnd = `        rating: 4.5
    }
];`;

const startIdxProd = content.indexOf(oldProdStart);
const endIdxProd = content.indexOf(oldProdEnd, startIdxProd) + oldProdEnd.length;

const newProductsArray = `const products = [
    {
        name: 'Authentic Banarasi Silk Saree',
        category: 'Textiles',
        price: 8500.00,
        description: 'A luxurious Banarasi silk saree with intricate zari work, handwoven by artisans in Varanasi.',
        stock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e5509c530c?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 98,
        handmadeReasoning: "The zari distribution shows natural handloom inconsistencies.",
        handmadeKeyObservations: ["Irregular zari tension", "Handloom border weaving", "Natural silk texture"],
        ecoScore: { material: 8, carbon: 6, recycling: 9, total: 23 },
        sales: 12,
        rating: 4.8
    },
    {
        name: 'Jaipur Blue Pottery Vase',
        category: 'Pottery',
        price: 3200.00,
        description: 'Traditional handcrafted blue pottery vase from Jaipur, painted with floral motifs. No clay is used, only quartz stone powder.',
        stock: 3,
        imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 99,
        handmadeReasoning: "Brush strokes on floral motifs vary slightly.",
        handmadeKeyObservations: ["Varying brush stroke pressure", "Quartz base texture", "Indigo color nuances"],
        ecoScore: { material: 10, carbon: 9, recycling: 5, total: 24 },
        sales: 8,
        rating: 4.9
    },
    {
        name: 'Kundan Meenakari Necklace Set',
        category: 'Jewelry',
        price: 4500.00,
        description: 'Exquisite Kundan jewelry with intricate Meenakari enamel work on the reverse side.',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 95,
        handmadeReasoning: "Enamel filling demonstrates manual layering in the Meenakari.",
        handmadeKeyObservations: ["Manual enamel layering", "Hand-set kundan", "Gold foil variations"],
        sales: 15,
        rating: 4.7
    },
    {
        name: 'Madhubani Canvas Painting',
        category: 'Art',
        price: 2800.00,
        description: 'Original Madhubani (Mithila) painting depicting nature, created with natural dyes and nib-pens.',
        stock: 1,
        imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 100,
        handmadeReasoning: "Freehand geometric patterns and natural dye absorption.",
        handmadeKeyObservations: ["Slight geometric asymmetry", "Natural dye coloring", "Intricate line work"],
        sales: 3,
        rating: 5.0
    },
    {
        name: 'Dhokra Brass Elephant Figurine',
        category: 'Home Decor',
        price: 1800.00,
        description: 'Handcrafted brass elephant made using the ancient lost-wax casting technique (Dhokra art).',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 97,
        handmadeReasoning: "Residue of clay molds and unique casting variations.",
        handmadeKeyObservations: ["Lost-wax string details", "Minor casting pores", "Antique finish"],
        ecoScore: { material: 10, carbon: 8, recycling: 10, total: 28 },
        sales: 22,
        rating: 4.6
    },
    {
        name: 'Kalamkari Hand-Block Printed Dupatta',
        category: 'Textiles',
        price: 1500.00,
        description: 'Cotton dupatta featuring traditional Kalamkari block prints, made using natural colors.',
        stock: 4,
        imageUrl: 'https://images.unsplash.com/photo-1520699049698-acd2fce18736?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 96,
        handmadeReasoning: "Color bleeding and block alignment overlaps characteristic of hand-printing.",
        handmadeKeyObservations: ["Block edge overlap", "Natural color bleeding", "Hand-stamped pressure"],
        sales: 9,
        rating: 4.8
    },
    {
        name: 'Pashmina Shawl with Sozni Embroidery',
        category: 'Textiles',
        price: 12000.00,
        description: 'Pure Pashmina shawl featuring delicate needlework (Sozni) from Kashmir.',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 92,
        handmadeReasoning: "Thread tension and stitch intervals denote manual needlework.",
        handmadeKeyObservations: ["Manual stitch tension", "Intricate thread alignment", "Authentic raw wool"],
        ecoScore: { material: 7, carbon: 8, recycling: 4, total: 19 },
        sales: 18,
        rating: 4.5
    },
    {
        name: 'Khurja Ceramic Chai Kulhad Set',
        category: 'Pottery',
        price: 800.00,
        description: 'Set of 6 traditional ceramic chai cups (Kulhads) hand-painted by Khurja artisans.',
        stock: 6,
        imageUrl: 'https://images.unsplash.com/photo-1614532292834-315ec03112bd?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 99,
        handmadeReasoning: "Each cup has slightly different dimensions due to wheel throwing.",
        handmadeKeyObservations: ["Wheel-thrown asymmetry", "Hand-painted borders", "Unglazed base"],
        sales: 14,
        rating: 4.7
    },
    {
        name: 'Silver Filigree (Tarakasi) Earrings',
        category: 'Jewelry',
        price: 2400.00,
        description: 'Delicate Tarakasi silver filigree work earrings from Cuttack.',
        stock: 2,
        imageUrl: 'https://images.unsplash.com/photo-1599643478524-4f9e1ba4eee5?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 98,
        handmadeReasoning: "Wire density and twisting patterns indicate meticulous hand crimping.",
        handmadeKeyObservations: ["Hand-crimped silver wire", "Solder joints visible", "Micro-detail variations"],
        sales: 6,
        rating: 4.9
    },
    {
        name: 'Channapatna Wooden Toys Set',
        category: 'Home Decor',
        price: 1200.00,
        description: 'Eco-friendly, chemical-free wooden toys finished with natural vegetable dyes.',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1603006905593-3ea7b311746a?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 88,
        handmadeReasoning: "Lathe marks and color absorption indicate traditional Channapatna crafting.",
        handmadeKeyObservations: ["Lacquered natural dye finish", "Lathe indentations", "Organic wood grain"],
        ecoScore: { material: 9, carbon: 9, recycling: 10, total: 28 },
        sales: 31,
        rating: 4.4
    },
    {
        name: 'Bishnupur Terracotta Wall Hanging',
        category: 'Pottery',
        price: 650.00,
        description: 'Bishnupur style terracotta wall hanging capturing Indian folk tales.',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 94,
        handmadeReasoning: "Fired clay color variations and manual sculpting marks.",
        handmadeKeyObservations: ["Fired terracotta hues", "Manual carving indentations", "Earthy texture"],
        ecoScore: { material: 10, carbon: 9, recycling: 10, total: 29 },
        sales: 16,
        rating: 4.6
    },
    {
        name: 'Banjara Tribal Embroidery Bag',
        category: 'Textiles',
        price: 1600.00,
        description: 'Vibrant tote bag featuring mirror work and intricate Banjara tribal embroidery.',
        stock: 4,
        imageUrl: 'https://images.unsplash.com/photo-1599643478524-4f9e1ba4eee5?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 97,
        handmadeReasoning: "Hand-stitched mirrors hold slight unevenness indicative of raw craft.",
        handmadeKeyObservations: ["Hand-secured mirrors", "Tribal stitch patterns", "Colorful thread tension"],
        sales: 11,
        rating: 4.8
    },
    {
        name: 'Kashmiri Walnut Wood Carved Box',
        category: 'Home Decor',
        price: 3600.00,
        description: 'Intricately hand-carved jewelry box made from seasoned Kashmiri walnut wood.',
        stock: 1,
        imageUrl: 'https://images.unsplash.com/photo-1614532292834-315ec03112bd?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 99,
        handmadeReasoning: "Chisel marks define the floral carvings deep in the wood.",
        handmadeKeyObservations: ["Deep chisel marks", "Walnut wood grain", "Floral pattern symmetry"],
        sales: 2,
        rating: 5.0
    },
    {
        name: 'Kolhapuri Leather Chappals (Sandals)',
        category: 'Textiles',
        price: 950.00,
        description: 'Authentic handcrafted Kolhapuri leather sandals, tanned with vegetable dyes.',
        stock: 11,
        imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 96,
        handmadeReasoning: "Leather weaving techniques show hand-pulled tension.",
        handmadeKeyObservations: ["Hand-braided leather", "Vegetable tanning marks", "Stitching thickness"],
        sales: 19,
        rating: 4.5
    }
];`;

content = content.slice(0, startIdxProd) + newProductsArray + content.slice(endIdxProd);

fs.writeFileSync(seedPath, content, 'utf-8');
console.log('Successfully updated seed.js with authentic Indian products and prices!');
