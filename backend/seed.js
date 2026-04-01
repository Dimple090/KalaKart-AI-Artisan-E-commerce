const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const bcrypt = require('bcryptjs');

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
    {
        name: 'Master Artisan',
        email: 'artisan@kalakart.com',
        password: 'password123',
        role: 'artisan'
    },
    {
        name: 'Happy Customer',
        email: 'buyer@kalakart.com',
        password: 'password123',
        role: 'buyer'
    }
];

const products = [
    {
        name: 'Handcrafted Ceramic Vase',
        category: 'Pottery',
        price: 45.00,
        description: 'A beautiful wheel-thrown ceramic vase with a deep earthy glaze. Perfect for dried flowers or as a standalone centerpiece. Fired at high temperatures for durability. You can feel the subtle finger ridges from the throwing process.',
        stock: 5,
        imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 98,
        handmadeReasoning: "The glaze distribution shows natural inconsistencies impossible to replicate by machine. Slight asymmetry in the rim indicates it was hand-thrown on a potter's wheel rather than slip-cast.",
        handmadeKeyObservations: [
            "Subtle finger ridges visible on the interior walls.",
            "Natural glaze dripping near the base.",
            "Slight organic asymmetry in the overall shape."
        ],
        ecoScore: { material: 8, carbon: 6, recycling: 9, total: 23 }
    },
    {
        name: 'Bohemian Woven Wall Hanging',
        category: 'Textiles',
        price: 120.00,
        description: 'Intricately handwoven macramé wall tapestry made from 100% natural, undyed cotton cord. Adds a warm, textured bohemian vibe to any living space. Sourced from local cotton farmers.',
        stock: 3,
        imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 99,
        handmadeReasoning: "The knot tension varies slightly throughout the piece, a hallmark of manual macramé. The fringed ends exhibit natural, uneven fraying rather than laser-cut precision.",
        handmadeKeyObservations: [
            "Inconsistent knot tension typical of human hand-tying.",
            "Organic, uneven fraying at the tapestry bottom.",
            "Use of raw, unbleached natural fibers."
        ],
        ecoScore: { material: 10, carbon: 9, recycling: 5, total: 24 }
    },
    {
        name: 'Sterling Silver Moonstone Ring',
        category: 'Jewelry',
        price: 185.00,
        description: 'Delicate handcrafted sterling silver ring featuring a mesmerizing, ethically sourced rainbow moonstone. The band is hammered by hand for a textured, light-catching finish.',
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 95,
        handmadeReasoning: "The silver band displays irregular hammered indentations that scatter light organically. The bezel setting around the moonstone is custom-fitted to the uneven shape of the raw gem.",
        handmadeKeyObservations: [
            "Irregular hammered texture on the silver band.",
            "Custom bezel fitting indicating it is not a mass-produced cast.",
            "Slight visible solder seams on the inner joint."
        ]
    },
    {
        name: 'Abstract Sunset Oil Painting',
        category: 'Art',
        price: 350.00,
        description: 'Original canvas oil painting capturing a vibrant sunset over the ocean. Painted with thick impasto strokes for heavy texture and vivid color presence using a palette knife. Comes unframed.',
        stock: 1,
        imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 100,
        handmadeReasoning: "Thick, highly elevated impasto strokes created via palette knife are currently impossible for mass-printing machines to replicate accurately. Each stroke is entirely unique.",
        handmadeKeyObservations: [
            "Thick impasto texture rising off the canvas.",
            "Unique color blending occurring directly on the canvas surface.",
            "Visible raw canvas edges."
        ]
    },
    {
        name: 'Rustic Reclaimed Walnut Tray',
        category: 'Home Decor',
        price: 65.00,
        description: 'Hand-carved out of 100-year-old reclaimed barn walnut wood. Coated with food-safe beeswax and mineral oil. Features hand-forged wrought-iron handles for a perfect farmhouse aesthetic.',
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 97,
        handmadeReasoning: "The wood grain features natural knots and historical nail holes from its previous life as a barn door. The iron handles show striking marks from a blacksmith's hammer.",
        handmadeKeyObservations: [
            "Historical nail holes and distressing left intact.",
            "Hammer marks visible on the wrought-iron handles.",
            "Hand-rubbed oil finish rather than sprayed polyurethane."
        ],
        ecoScore: { material: 10, carbon: 8, recycling: 10, total: 28 }
    },
    {
        name: 'Oversized Hand-Knit Throw Blanket',
        category: 'Textiles',
        price: 180.00,
        description: 'Chunky, ultra-soft merino wool blanket, arm-knit for a dramatic, cozy look. Perfect for cold winter nights or draping over a sofa. Hypoallergenic and incredibly warm.',
        stock: 4,
        imageUrl: 'https://images.unsplash.com/photo-1520699049698-acd2fce18736?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 96,
        handmadeReasoning: "The massive scale of the stitches indicates an arm-knitting technique. Tension varies slightly based on the artisan's arm movements, creating a beautifully imperfect, organic drape.",
        handmadeKeyObservations: [
            "Varying stitch tension characteristic of arm-knitting.",
            "Unspun wool roving used instead of tightly milled commercial yarn.",
            "No factory-finished seams."
        ]
    },
    {
        name: 'Hand-Painted Silk Scarf',
        category: 'Textiles',
        price: 55.00,
        description: '100% pure silk scarf, hand-dyed with vibrant floral patterns using eco-friendly watercolors. Soft, lightweight, and elegant. Each piece has slightly different dye bleeding.',
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 92,
        handmadeReasoning: "The watercolor dye boundaries are blurred and bleed naturally into the silk fibers, an effect typical of hand-painting rather than digital textile printing.",
        handmadeKeyObservations: [
            "Natural dye bleeding at color boundaries.",
            "Slight variations in floral motif scale.",
            "Hand-rolled and hand-stitched edges."
        ],
        ecoScore: { material: 7, carbon: 8, recycling: 4, total: 19 }
    },
    {
        name: 'Speckled Matcha Bowl',
        category: 'Pottery',
        price: 38.00,
        description: 'Traditional Japanese-style matcha bowl (chawan) with a rustic speckled glaze and exposed raw clay base. Thrown on the wheel with mindful attention to form to perfectly fit the palms.',
        stock: 6,
        imageUrl: 'https://images.unsplash.com/photo-1614532292834-315ec03112bd?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 99,
        handmadeReasoning: "The unglazed foot ring displays the raw texture of the clay body and was clearly trimmed by hand. The glaze speckling is entirely random and dictated by the kiln atmosphere.",
        handmadeKeyObservations: [
            "Hand-trimmed foot ring exposing raw clay.",
            "Randomized glaze speckling from atmospheric kiln firing.",
            "Intentional dimpling on the sides for thumb placement."
        ]
    },
    {
        name: 'Raw Turquoise Gold Pendant',
        category: 'Jewelry',
        price: 145.00,
        description: 'A stunning raw, unpolished turquoise stone set in highly textured 14k gold-fill wire wrapping. The cage design firmly holds the stone while exposing its natural, rugged beauty.',
        stock: 2,
        imageUrl: 'https://images.unsplash.com/photo-1599643478524-4f9e1ba4eee5?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 98,
        handmadeReasoning: "Wire-wrapping is an inherently manual process. The wire tension and winding paths intricately adapt to the unique, non-uniform shape of the raw turquoise nugget.",
        handmadeKeyObservations: [
            "Adaptive wire wrapping responding to the specific stone's shape.",
            "Pliers marks subtly visible on wire tucks.",
            "Raw, uncalibrated gemstone utilized."
        ]
    },
    {
        name: 'Hand-Poured Soy Wax Botanical Candle',
        category: 'Home Decor',
        price: 28.00,
        description: 'Eco-friendly soy wax candle hand-poured into a reusable amber glass jar. Infused with natural lavender and sage essential oils, and topped with real dried botanicals.',
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1603006905593-3ea7b311746a?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 88,
        handmadeReasoning: "The arrangement of the dried lavender and sage leaves on the surface of the candle is random and manually applied before the wax fully cools.",
        handmadeKeyObservations: [
            "Randomized placement of surface botanicals.",
            "Slight wax adhesion variations on the jar walls (wet spots) typical of hand-poured soy.",
            "Slightly off-center cotton wick."
        ],
        ecoScore: { material: 9, carbon: 9, recycling: 10, total: 28 }
    },
    {
        name: 'Terracotta Hand-Painted Clay Pot',
        category: 'Pottery',
        price: 35.00,
        description: 'Authentic terracotta clay pot, hand-shaped and sun-dried before firing. Features intricate geometric patterns painted by hand using natural white clay slips. Ideal for indoor plants.',
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 94,
        handmadeReasoning: "The surface texture of the terracotta is slightly porous and unrefined, consistent with raw artisan clay. The hand-painted white slip patterns show slight variations in brush stroke width.",
        handmadeKeyObservations: [
            "Porous, unrefined terracotta texture.",
            "Variations in brush stroke width on the geometric patterns.",
            "Subtle asymmetry in the overall vessel shape."
        ],
        ecoScore: { material: 10, carbon: 9, recycling: 10, total: 29 }
    },
    {
        name: 'Vintage Style Brass & Beaded Necklace',
        category: 'Jewelry',
        price: 95.00,
        description: 'A striking vintage-inspired necklace featuring a hand-cut brass medallion, surrounded by individually knotted semi-precious agate beads on a silk thread.',
        stock: 4,
        imageUrl: 'https://images.unsplash.com/photo-1599643478524-4f9e1ba4eee5?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 97,
        handmadeReasoning: "Each bead is individually hand-knotted, a tedious manual process that prevents beads from scattering if broken. The brass medallion shows tiny jeweler's saw marks on its edges.",
        handmadeKeyObservations: [
            "Individual hand-knotting between each agate bead.",
            "Tiny jeweler's saw marks visible on the brass medallion edges.",
            "Slight variations in bead size and color banding."
        ]
    },
    {
        name: 'Tall Indigo Glazed Floor Vase',
        category: 'Pottery',
        price: 210.00,
        description: 'A massive, 3-foot tall floor vase built using the traditional coil method. Glazed in a stunning, deep indigo blue that drips naturally down the sides. A true statement piece.',
        stock: 1,
        imageUrl: 'https://images.unsplash.com/photo-1614532292834-315ec03112bd?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 99,
        handmadeReasoning: "The coil-building technique leaves subtle horizontal undulations along the interior and exterior walls. The heavy glaze dripping is completely organic and cannot be replicated.",
        handmadeKeyObservations: [
            "Horizontal undulations indicating a manual coil-building process.",
            "Organic, heavy glaze dripping.",
            "Massive scale requiring significant manual strength to shape."
        ]
    },
    {
        name: 'Hammered Copper Cuff Bracelet',
        category: 'Jewelry',
        price: 50.00,
        description: 'Simple, elegant, and earthy. This wide cuff bracelet is forged from pure copper and heavily hammered for a dazzling, light-reflecting texture. Treated to prevent rapid tarnishing.',
        stock: 11,
        imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=800&auto=format&fit=crop',
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 96,
        handmadeReasoning: "The hammered texture (planishing) is entirely random. The depth and angle of each dimple varies, confirming it was struck by a human holding a hammer rather than a machine press.",
        handmadeKeyObservations: [
            "Randomized depth and angle of hammer dimples.",
            "Slightly uneven edges characteristic of hand-sawed copper sheet.",
            "Fire-scale discoloration occasionally visible on the inner band."
        ]
    }
];

const seedData = async () => {
    try {
        await connectDB();

        // Clear existing database collections entirely or keep them?
        // Let's clear users who are not admin? Actually we can just do a fresh wipe or push if they don't exist.
        // Let's wipe Products and Users for a clean slate
        console.log('Wiping existing database...');
        await User.deleteMany();
        await Product.deleteMany();

        console.log('Creating users...');
        const createdUsers = [];
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
        }
        const artisanUser = createdUsers.find(u => u.role === 'artisan');

        console.log('Creating products under Master Artisan...');
        const productsWithArtisan = products.map(product => {
            return {
                ...product,
                artisan: artisanUser._id
            };
        });

        await Product.insertMany(productsWithArtisan);

        console.log('Database successfully seeded with realistic data!');
        process.exit();
    } catch (error) {
        console.error(`Error during seeding: ${error.message}`);
        process.exit(1);
    }
};

seedData();
