const mongoose = require('mongoose');
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

const products = [
    {
        name: "Authentic Textiles - Bandhani, Tie dye dr",
        category: "Textiles",
        price: 6066,
        description: "A stunning, 100% genuine handcrafted piece. Bandhani, Tie dye dresses drying in Jaipur. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 4,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Bandhani%2C_Tie_dye_dresses_drying_in_Jaipur.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/6/6b/Bandhani%2C_Tie_dye_dresses_drying_in_Jaipur.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/c/c0/Assamese_Muga_With_Japi.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/3eO5u0PntgA",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 98,
        sales: 43,
        rating: "4.2"
    },
    {
        name: "Authentic Textiles - Assamese Muga With J",
        category: "Textiles",
        price: 3312,
        description: "A stunning, 100% genuine handcrafted piece. Assamese Muga With Japi. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 7,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Assamese_Muga_With_Japi.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/c/c0/Assamese_Muga_With_Japi.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/6/6d/Brassi%C3%A8re_d%27enfant_en_indienne-Mus%C3%A9e_de_la_Compagnie_des_Indes.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/_eNNxgA7kQM",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 92,
        sales: 34,
        rating: "4.3"
    },
    {
        name: "Authentic Textiles - Brassière d'enfant e",
        category: "Textiles",
        price: 918,
        description: "A stunning, 100% genuine handcrafted piece. Brassière d'enfant en indienne-Musée de la Compagnie des Indes. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 13,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Brassi%C3%A8re_d%27enfant_en_indienne-Mus%C3%A9e_de_la_Compagnie_des_Indes.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/6/6d/Brassi%C3%A8re_d%27enfant_en_indienne-Mus%C3%A9e_de_la_Compagnie_des_Indes.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/a/ad/B%C3%A9guin_d%27enfant_en_indienne_rouge-Mus%C3%A9e_de_la_Compagnie_des_Indes_%281%29.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/1B1lG3f9g-8",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 92,
        sales: 39,
        rating: "4.1"
    },
    {
        name: "Authentic Textiles - Béguin d'enfant en i",
        category: "Textiles",
        price: 1763,
        description: "A stunning, 100% genuine handcrafted piece. Béguin d'enfant en indienne rouge-Musée de la Compagnie des Indes (1). This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 14,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ad/B%C3%A9guin_d%27enfant_en_indienne_rouge-Mus%C3%A9e_de_la_Compagnie_des_Indes_%281%29.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/a/ad/B%C3%A9guin_d%27enfant_en_indienne_rouge-Mus%C3%A9e_de_la_Compagnie_des_Indes_%281%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/7/72/B%C3%A9guin_d%27enfant_en_indienne_rouge-Mus%C3%A9e_de_la_Compagnie_des_Indes_%282%29.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/Q9R97Jv3jJc",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 98,
        sales: 38,
        rating: "4.2"
    },
    {
        name: "Authentic Textiles - Béguin d'enfant en i",
        category: "Textiles",
        price: 8125,
        description: "A stunning, 100% genuine handcrafted piece. Béguin d'enfant en indienne rouge-Musée de la Compagnie des Indes (2). This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 4,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/72/B%C3%A9guin_d%27enfant_en_indienne_rouge-Mus%C3%A9e_de_la_Compagnie_des_Indes_%282%29.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/7/72/B%C3%A9guin_d%27enfant_en_indienne_rouge-Mus%C3%A9e_de_la_Compagnie_des_Indes_%282%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/e/ed/Blankets_of_NE_India_%2810368356%29.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/hB2g7T97yKw",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 95,
        sales: 12,
        rating: "4.9"
    },
    {
        name: "Authentic Textiles - Blankets of NE India",
        category: "Textiles",
        price: 3150,
        description: "A stunning, 100% genuine handcrafted piece. Blankets of NE India (10368356). This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 6,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Blankets_of_NE_India_%2810368356%29.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/e/ed/Blankets_of_NE_India_%2810368356%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/a/a5/Ceremonial_Textile_%28Kain_Sembagi%29_LACMA_M.91.184.650.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/3eO5u0PntgA",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 94,
        sales: 31,
        rating: "4.5"
    },
    {
        name: "Authentic Textiles - Ceremonial Textile (",
        category: "Textiles",
        price: 8088,
        description: "A stunning, 100% genuine handcrafted piece. Ceremonial Textile (Kain Sembagi) LACMA M.91.184.650. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 6,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Ceremonial_Textile_%28Kain_Sembagi%29_LACMA_M.91.184.650.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/a/a5/Ceremonial_Textile_%28Kain_Sembagi%29_LACMA_M.91.184.650.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/2/24/A_traditional_Bagh_Print_craftsman_Mohammed_Bilal_Khatri_from_Bagh%2C_Madhya_Pradesh%2C_at_Surajkund_International_Crafts_Mela_2015.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/_eNNxgA7kQM",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 97,
        sales: 47,
        rating: "4.2"
    },
    {
        name: "Authentic Textiles - A traditional Bagh P",
        category: "Textiles",
        price: 1272,
        description: "A stunning, 100% genuine handcrafted piece. A traditional Bagh Print craftsman Mohammed Bilal Khatri from Bagh, Madhya Pradesh, at Surajkund International Crafts Mela 2015. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 6,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/24/A_traditional_Bagh_Print_craftsman_Mohammed_Bilal_Khatri_from_Bagh%2C_Madhya_Pradesh%2C_at_Surajkund_International_Crafts_Mela_2015.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/2/24/A_traditional_Bagh_Print_craftsman_Mohammed_Bilal_Khatri_from_Bagh%2C_Madhya_Pradesh%2C_at_Surajkund_International_Crafts_Mela_2015.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/a/a4/Carpet_with_a_millefleur_pattern_MET_DP265197.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/1B1lG3f9g-8",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 98,
        sales: 15,
        rating: "4.6"
    },
    {
        name: "Authentic Textiles - Carpet with a millef",
        category: "Textiles",
        price: 4527,
        description: "A stunning, 100% genuine handcrafted piece. Carpet with a millefleur pattern MET DP265197. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 2,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Carpet_with_a_millefleur_pattern_MET_DP265197.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/a/a4/Carpet_with_a_millefleur_pattern_MET_DP265197.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/d/df/107_Jugement_condamnant_Isabelle_Champiron_pour_le_commerce_des_toiles_des_Indes.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/Q9R97Jv3jJc",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 98,
        sales: 36,
        rating: "4.5"
    },
    {
        name: "Authentic Textiles - 107 Jugement condamn",
        category: "Textiles",
        price: 2127,
        description: "A stunning, 100% genuine handcrafted piece. 107 Jugement condamnant Isabelle Champiron pour le commerce des toiles des Indes. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 5,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/df/107_Jugement_condamnant_Isabelle_Champiron_pour_le_commerce_des_toiles_des_Indes.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/d/df/107_Jugement_condamnant_Isabelle_Champiron_pour_le_commerce_des_toiles_des_Indes.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/6/6f/Benares%2C_kurtani_%28vestito_da_donna%29%2C_con_ricamo_floreale_e_bordature_karchobi%2C_xix_secolo.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/hB2g7T97yKw",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 96,
        sales: 23,
        rating: "4.2"
    },
    {
        name: "Authentic Textiles - Benares, kurtani (ve",
        category: "Textiles",
        price: 6075,
        description: "A stunning, 100% genuine handcrafted piece. Benares, kurtani (vestito da donna), con ricamo floreale e bordature karchobi, xix secolo. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 9,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Benares%2C_kurtani_%28vestito_da_donna%29%2C_con_ricamo_floreale_e_bordature_karchobi%2C_xix_secolo.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/6/6f/Benares%2C_kurtani_%28vestito_da_donna%29%2C_con_ricamo_floreale_e_bordature_karchobi%2C_xix_secolo.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/5/59/19th_Century_Embroidery_%28Focussed%29.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/3eO5u0PntgA",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 94,
        sales: 18,
        rating: "4.9"
    },
    {
        name: "Authentic Textiles - 19th Century Embroid",
        category: "Textiles",
        price: 4940,
        description: "A stunning, 100% genuine handcrafted piece. 19th Century Embroidery (Focussed). This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 3,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/59/19th_Century_Embroidery_%28Focussed%29.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/5/59/19th_Century_Embroidery_%28Focussed%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/7/7e/19th_Century_Chamba_Rumal.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/_eNNxgA7kQM",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 93,
        sales: 27,
        rating: "4.6"
    },
    {
        name: "Authentic Textiles - 19th Century Chamba ",
        category: "Textiles",
        price: 2118,
        description: "A stunning, 100% genuine handcrafted piece. 19th Century Chamba Rumal. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 15,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7e/19th_Century_Chamba_Rumal.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/7/7e/19th_Century_Chamba_Rumal.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/4/41/19th_Century_Embroidery.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/1B1lG3f9g-8",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 90,
        sales: 16,
        rating: "4.8"
    },
    {
        name: "Authentic Textiles - 19th Century Embroid",
        category: "Textiles",
        price: 3032,
        description: "A stunning, 100% genuine handcrafted piece. 19th Century Embroidery. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 14,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/41/19th_Century_Embroidery.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/4/41/19th_Century_Embroidery.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/d/d8/ChevronbeadsIndian.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/Q9R97Jv3jJc",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 97,
        sales: 37,
        rating: "4.0"
    },
    {
        name: "Authentic Home Decor - ChevronbeadsIndian",
        category: "Home Decor",
        price: 3217,
        description: "A stunning, 100% genuine handcrafted piece. ChevronbeadsIndian. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 13,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d8/ChevronbeadsIndian.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/d/d8/ChevronbeadsIndian.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/b/bb/A_shop_selling_wedding_items_and_sindoor_boxes%2C_Varanasi.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/hB2g7T97yKw",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 91,
        sales: 18,
        rating: "4.7"
    },
    {
        name: "Authentic Home Decor - A shop selling weddi",
        category: "Home Decor",
        price: 7548,
        description: "A stunning, 100% genuine handcrafted piece. A shop selling wedding items and sindoor boxes, Varanasi. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 5,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bb/A_shop_selling_wedding_items_and_sindoor_boxes%2C_Varanasi.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/b/bb/A_shop_selling_wedding_items_and_sindoor_boxes%2C_Varanasi.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/f/fe/ARTESANIA.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/3eO5u0PntgA",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 96,
        sales: 39,
        rating: "4.4"
    },
    {
        name: "Authentic Home Decor - ARTESANIA",
        category: "Home Decor",
        price: 7402,
        description: "A stunning, 100% genuine handcrafted piece. ARTESANIA. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 11,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fe/ARTESANIA.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/f/fe/ARTESANIA.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/4/40/A_Handful_of_Southern_India_Cusine.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/_eNNxgA7kQM",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 96,
        sales: 45,
        rating: "4.1"
    },
    {
        name: "Authentic Home Decor - A Handful of Souther",
        category: "Home Decor",
        price: 546,
        description: "A stunning, 100% genuine handcrafted piece. A Handful of Southern India Cusine. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 6,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/40/A_Handful_of_Southern_India_Cusine.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/4/40/A_Handful_of_Southern_India_Cusine.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/7/74/Beaded_embroidery_work.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/1B1lG3f9g-8",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 99,
        sales: 10,
        rating: "4.1"
    },
    {
        name: "Authentic Home Decor - Beaded embroidery wo",
        category: "Home Decor",
        price: 6539,
        description: "A stunning, 100% genuine handcrafted piece. Beaded embroidery work. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 2,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/74/Beaded_embroidery_work.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/7/74/Beaded_embroidery_work.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/6/6e/Decorations_work.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/Q9R97Jv3jJc",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 92,
        sales: 22,
        rating: "4.5"
    },
    {
        name: "Authentic Home Decor - Decorations work",
        category: "Home Decor",
        price: 5313,
        description: "A stunning, 100% genuine handcrafted piece. Decorations work. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 15,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Decorations_work.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/6/6e/Decorations_work.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/b/bc/Bell_metal_handicraft_Sarthebari.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/hB2g7T97yKw",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 93,
        sales: 18,
        rating: "4.8"
    },
    {
        name: "Authentic Home Decor - Bell metal handicraf",
        category: "Home Decor",
        price: 588,
        description: "A stunning, 100% genuine handcrafted piece. Bell metal handicraft Sarthebari. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 6,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bc/Bell_metal_handicraft_Sarthebari.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/b/bc/Bell_metal_handicraft_Sarthebari.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/0/01/Bell_metal_handicraft.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/3eO5u0PntgA",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 95,
        sales: 42,
        rating: "4.8"
    },
    {
        name: "Authentic Home Decor - Bell metal handicraf",
        category: "Home Decor",
        price: 6940,
        description: "A stunning, 100% genuine handcrafted piece. Bell metal handicraft. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 5,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/01/Bell_metal_handicraft.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/0/01/Bell_metal_handicraft.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/d/df/Ashish_kansara.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/_eNNxgA7kQM",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 90,
        sales: 27,
        rating: "4.6"
    },
    {
        name: "Authentic Home Decor - Ashish kansara",
        category: "Home Decor",
        price: 2062,
        description: "A stunning, 100% genuine handcrafted piece. Ashish kansara. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 14,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/df/Ashish_kansara.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/d/df/Ashish_kansara.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/f/f9/A_flared_lehenga.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/1B1lG3f9g-8",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 99,
        sales: 3,
        rating: "4.8"
    },
    {
        name: "Authentic Home Decor - A flared lehenga",
        category: "Home Decor",
        price: 985,
        description: "A stunning, 100% genuine handcrafted piece. A flared lehenga. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 13,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f9/A_flared_lehenga.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/f/f9/A_flared_lehenga.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/b/b1/%22Nadang%22_The_Adi_Basket.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/Q9R97Jv3jJc",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 97,
        sales: 15,
        rating: "4.1"
    },
    {
        name: "Authentic Home Decor - \"Nadang\" The Adi Bas",
        category: "Home Decor",
        price: 6344,
        description: "A stunning, 100% genuine handcrafted piece. \"Nadang\" The Adi Basket. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 13,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b1/%22Nadang%22_The_Adi_Basket.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/b/b1/%22Nadang%22_The_Adi_Basket.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/a/a4/Bamboo_crafted_dancing_lady_from_Samaguri_Satra.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/hB2g7T97yKw",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 95,
        sales: 16,
        rating: "4.5"
    },
    {
        name: "Authentic Home Decor - Bamboo crafted danci",
        category: "Home Decor",
        price: 4290,
        description: "A stunning, 100% genuine handcrafted piece. Bamboo crafted dancing lady from Samaguri Satra. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 11,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Bamboo_crafted_dancing_lady_from_Samaguri_Satra.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/a/a4/Bamboo_crafted_dancing_lady_from_Samaguri_Satra.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/0/0a/Ancient_Storage_Jar.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/3eO5u0PntgA",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 91,
        sales: 42,
        rating: "4.1"
    },
    {
        name: "Authentic Home Decor - Ancient Storage Jar",
        category: "Home Decor",
        price: 2004,
        description: "A stunning, 100% genuine handcrafted piece. Ancient Storage Jar. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 1,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/0a/Ancient_Storage_Jar.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/0/0a/Ancient_Storage_Jar.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/9/90/A_Contemporary_Chamba_Thaal_showing_Dashavatars_of_Vishnu.png"
        ],
        videoUrl: "https://www.youtube.com/embed/_eNNxgA7kQM",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 98,
        sales: 32,
        rating: "4.5"
    },
    {
        name: "Authentic Home Decor - A Contemporary Chamb",
        category: "Home Decor",
        price: 658,
        description: "A stunning, 100% genuine handcrafted piece. A Contemporary Chamba Thaal showing Dashavatars of Vishnu. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 1,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/90/A_Contemporary_Chamba_Thaal_showing_Dashavatars_of_Vishnu.png",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/9/90/A_Contemporary_Chamba_Thaal_showing_Dashavatars_of_Vishnu.png",
            "https://upload.wikimedia.org/wikipedia/commons/d/d9/An_array_of_jewellery_being_sold_at_Rishikesh.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/1B1lG3f9g-8",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 97,
        sales: 42,
        rating: "4.5"
    },
    {
        name: "Authentic Jewelry - An array of jeweller",
        category: "Jewelry",
        price: 3660,
        description: "A stunning, 100% genuine handcrafted piece. An array of jewellery being sold at Rishikesh. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 6,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d9/An_array_of_jewellery_being_sold_at_Rishikesh.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/d/d9/An_array_of_jewellery_being_sold_at_Rishikesh.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/1/13/A_Lady_Playing_the_Tanpura%2C_ca._1735.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/Q9R97Jv3jJc",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 99,
        sales: 13,
        rating: "4.7"
    },
    {
        name: "Authentic Jewelry - A Lady Playing the T",
        category: "Jewelry",
        price: 5624,
        description: "A stunning, 100% genuine handcrafted piece. A Lady Playing the Tanpura, ca. 1735. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 8,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/13/A_Lady_Playing_the_Tanpura%2C_ca._1735.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/1/13/A_Lady_Playing_the_Tanpura%2C_ca._1735.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/8/8c/A-vangi_in_woman%27s_hand.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/hB2g7T97yKw",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 93,
        sales: 20,
        rating: "4.8"
    },
    {
        name: "Authentic Jewelry - A-vangi in woman's h",
        category: "Jewelry",
        price: 3471,
        description: "A stunning, 100% genuine handcrafted piece. A-vangi in woman's hand. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 12,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8c/A-vangi_in_woman%27s_hand.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/8/8c/A-vangi_in_woman%27s_hand.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/0/03/Actor_Misha_Bajwa_ethnic_look.png"
        ],
        videoUrl: "https://www.youtube.com/embed/3eO5u0PntgA",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 91,
        sales: 18,
        rating: "5.0"
    },
    {
        name: "Authentic Jewelry - Actor Misha Bajwa et",
        category: "Jewelry",
        price: 8417,
        description: "A stunning, 100% genuine handcrafted piece. Actor Misha Bajwa ethnic look. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 4,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/03/Actor_Misha_Bajwa_ethnic_look.png",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/0/03/Actor_Misha_Bajwa_ethnic_look.png",
            "https://upload.wikimedia.org/wikipedia/commons/0/09/Antique_Indian_Nose_Ring_Jewellery.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/_eNNxgA7kQM",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 90,
        sales: 12,
        rating: "4.8"
    },
    {
        name: "Authentic Jewelry - Antique Indian Nose ",
        category: "Jewelry",
        price: 2186,
        description: "A stunning, 100% genuine handcrafted piece. Antique Indian Nose Ring Jewellery. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 15,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/0/09/Antique_Indian_Nose_Ring_Jewellery.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/0/09/Antique_Indian_Nose_Ring_Jewellery.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/3/3d/Amyra_Dastur_walks_the_ramp_for_Pernia%E2%80%99s_Pop-Up_Show_%2802%29.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/1B1lG3f9g-8",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 99,
        sales: 25,
        rating: "4.2"
    },
    {
        name: "Authentic Jewelry - Amyra Dastur walks t",
        category: "Jewelry",
        price: 4005,
        description: "A stunning, 100% genuine handcrafted piece. Amyra Dastur walks the ramp for Pernia’s Pop-Up Show (02). This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 7,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Amyra_Dastur_walks_the_ramp_for_Pernia%E2%80%99s_Pop-Up_Show_%2802%29.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/3/3d/Amyra_Dastur_walks_the_ramp_for_Pernia%E2%80%99s_Pop-Up_Show_%2802%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chuda_and_kalire_ceremony.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/Q9R97Jv3jJc",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 92,
        sales: 36,
        rating: "4.7"
    },
    {
        name: "Authentic Jewelry - Chuda and kalire cer",
        category: "Jewelry",
        price: 2549,
        description: "A stunning, 100% genuine handcrafted piece. Chuda and kalire ceremony. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 15,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chuda_and_kalire_ceremony.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/c/cd/Chuda_and_kalire_ceremony.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/9/95/Pooja_during_Hindu_wedding.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/hB2g7T97yKw",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 99,
        sales: 37,
        rating: "5.0"
    },
    {
        name: "Authentic Jewelry - Pooja during Hindu w",
        category: "Jewelry",
        price: 2138,
        description: "A stunning, 100% genuine handcrafted piece. Pooja during Hindu wedding. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 1,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/95/Pooja_during_Hindu_wedding.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/9/95/Pooja_during_Hindu_wedding.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/6/62/2-4-60-a64-vivah-bridal-chura-original-imaf8h8wafycjzhu.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/3eO5u0PntgA",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 96,
        sales: 1,
        rating: "4.3"
    },
    {
        name: "Authentic Jewelry - 2-4-60-a64-vivah-bri",
        category: "Jewelry",
        price: 2394,
        description: "A stunning, 100% genuine handcrafted piece. 2-4-60-a64-vivah-bridal-chura-original-imaf8h8wafycjzhu. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 11,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/62/2-4-60-a64-vivah-bridal-chura-original-imaf8h8wafycjzhu.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/6/62/2-4-60-a64-vivah-bridal-chura-original-imaf8h8wafycjzhu.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/5/56/Jewelry_for_Indian_Wedding.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/_eNNxgA7kQM",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 93,
        sales: 18,
        rating: "4.3"
    },
    {
        name: "Authentic Jewelry - Jewelry for Indian W",
        category: "Jewelry",
        price: 2222,
        description: "A stunning, 100% genuine handcrafted piece. Jewelry for Indian Wedding. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 13,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/56/Jewelry_for_Indian_Wedding.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/5/56/Jewelry_for_Indian_Wedding.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/1/13/A_local_woman_with_traditional_jewellery_from_Sikkim%2C_India.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/1B1lG3f9g-8",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 95,
        sales: 34,
        rating: "4.3"
    },
    {
        name: "Authentic Jewelry - A local woman with t",
        category: "Jewelry",
        price: 915,
        description: "A stunning, 100% genuine handcrafted piece. A local woman with traditional jewellery from Sikkim, India. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 1,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/13/A_local_woman_with_traditional_jewellery_from_Sikkim%2C_India.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/1/13/A_local_woman_with_traditional_jewellery_from_Sikkim%2C_India.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/7/7a/Ancient_jewelry.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/Q9R97Jv3jJc",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 97,
        sales: 37,
        rating: "4.6"
    },
    {
        name: "Authentic Jewelry - Ancient jewelry",
        category: "Jewelry",
        price: 4017,
        description: "A stunning, 100% genuine handcrafted piece. Ancient jewelry. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 9,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Ancient_jewelry.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/7/7a/Ancient_jewelry.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/7/7d/Apatani_culture.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/hB2g7T97yKw",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 92,
        sales: 15,
        rating: "4.0"
    },
    {
        name: "Authentic Jewelry - Apatani culture",
        category: "Jewelry",
        price: 1685,
        description: "A stunning, 100% genuine handcrafted piece. Apatani culture. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 7,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Apatani_culture.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/7/7d/Apatani_culture.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/1/11/An_artwork_of_a_Meitei_woman_riding_on_a_wooden_boat_%26_trying_to_catch_fish_using_a_fishing_net_having_bamboo_pole_%26_frames%2C_using_one_of_her_hands_%26_both_legs_with_another_hand_holding_an_oar_%E2%80%94_MMRC%2C_Thoubal_district%2C_Kangleipak.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/3eO5u0PntgA",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 94,
        sales: 3,
        rating: "4.7"
    },
    {
        name: "Authentic Jewelry - An artwork of a Meit",
        category: "Jewelry",
        price: 3851,
        description: "A stunning, 100% genuine handcrafted piece. An artwork of a Meitei woman riding on a wooden boat & trying to catch fish using a fishing net having bamboo pole & frames, using one of her hands & both legs with another hand holding an oar — MMRC, Thoubal district, Kangleipak. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 3,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/11/An_artwork_of_a_Meitei_woman_riding_on_a_wooden_boat_%26_trying_to_catch_fish_using_a_fishing_net_having_bamboo_pole_%26_frames%2C_using_one_of_her_hands_%26_both_legs_with_another_hand_holding_an_oar_%E2%80%94_MMRC%2C_Thoubal_district%2C_Kangleipak.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/1/11/An_artwork_of_a_Meitei_woman_riding_on_a_wooden_boat_%26_trying_to_catch_fish_using_a_fishing_net_having_bamboo_pole_%26_frames%2C_using_one_of_her_hands_%26_both_legs_with_another_hand_holding_an_oar_%E2%80%94_MMRC%2C_Thoubal_district%2C_Kangleipak.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/f/fb/Al_Thani_Renaissance078_pendant_Inde.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/_eNNxgA7kQM",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 97,
        sales: 46,
        rating: "4.7"
    },
    {
        name: "Authentic Jewelry - Al Thani Renaissance",
        category: "Jewelry",
        price: 5882,
        description: "A stunning, 100% genuine handcrafted piece. Al Thani Renaissance078 pendant Inde. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 12,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fb/Al_Thani_Renaissance078_pendant_Inde.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/f/fb/Al_Thani_Renaissance078_pendant_Inde.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/6/6b/Bandhani%2C_Tie_dye_dresses_drying_in_Jaipur.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/1B1lG3f9g-8",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 96,
        sales: 24,
        rating: "4.9"
    },
    {
        name: "Authentic Textiles - Bandhani, Tie dye dr",
        category: "Textiles",
        price: 1674,
        description: "A stunning, 100% genuine handcrafted piece. Bandhani, Tie dye dresses drying in Jaipur. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 12,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Bandhani%2C_Tie_dye_dresses_drying_in_Jaipur.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/6/6b/Bandhani%2C_Tie_dye_dresses_drying_in_Jaipur.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/c/c0/Assamese_Muga_With_Japi.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/Q9R97Jv3jJc",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 95,
        sales: 18,
        rating: "5.0"
    },
    {
        name: "Authentic Textiles - Assamese Muga With J",
        category: "Textiles",
        price: 909,
        description: "A stunning, 100% genuine handcrafted piece. Assamese Muga With Japi. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 14,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Assamese_Muga_With_Japi.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/c/c0/Assamese_Muga_With_Japi.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/6/6d/Brassi%C3%A8re_d%27enfant_en_indienne-Mus%C3%A9e_de_la_Compagnie_des_Indes.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/hB2g7T97yKw",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 93,
        sales: 37,
        rating: "4.0"
    },
    {
        name: "Authentic Textiles - Brassière d'enfant e",
        category: "Textiles",
        price: 8053,
        description: "A stunning, 100% genuine handcrafted piece. Brassière d'enfant en indienne-Musée de la Compagnie des Indes. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 6,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Brassi%C3%A8re_d%27enfant_en_indienne-Mus%C3%A9e_de_la_Compagnie_des_Indes.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/6/6d/Brassi%C3%A8re_d%27enfant_en_indienne-Mus%C3%A9e_de_la_Compagnie_des_Indes.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/a/ad/B%C3%A9guin_d%27enfant_en_indienne_rouge-Mus%C3%A9e_de_la_Compagnie_des_Indes_%281%29.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/3eO5u0PntgA",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 98,
        sales: 40,
        rating: "4.4"
    },
    {
        name: "Authentic Textiles - Béguin d'enfant en i",
        category: "Textiles",
        price: 7376,
        description: "A stunning, 100% genuine handcrafted piece. Béguin d'enfant en indienne rouge-Musée de la Compagnie des Indes (1). This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 4,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ad/B%C3%A9guin_d%27enfant_en_indienne_rouge-Mus%C3%A9e_de_la_Compagnie_des_Indes_%281%29.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/a/ad/B%C3%A9guin_d%27enfant_en_indienne_rouge-Mus%C3%A9e_de_la_Compagnie_des_Indes_%281%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/7/72/B%C3%A9guin_d%27enfant_en_indienne_rouge-Mus%C3%A9e_de_la_Compagnie_des_Indes_%282%29.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/_eNNxgA7kQM",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 92,
        sales: 24,
        rating: "4.1"
    },
    {
        name: "Authentic Textiles - Béguin d'enfant en i",
        category: "Textiles",
        price: 7889,
        description: "A stunning, 100% genuine handcrafted piece. Béguin d'enfant en indienne rouge-Musée de la Compagnie des Indes (2). This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 15,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/72/B%C3%A9guin_d%27enfant_en_indienne_rouge-Mus%C3%A9e_de_la_Compagnie_des_Indes_%282%29.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/7/72/B%C3%A9guin_d%27enfant_en_indienne_rouge-Mus%C3%A9e_de_la_Compagnie_des_Indes_%282%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/e/ed/Blankets_of_NE_India_%2810368356%29.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/1B1lG3f9g-8",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 98,
        sales: 21,
        rating: "4.5"
    },
    {
        name: "Authentic Textiles - Blankets of NE India",
        category: "Textiles",
        price: 7365,
        description: "A stunning, 100% genuine handcrafted piece. Blankets of NE India (10368356). This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 14,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ed/Blankets_of_NE_India_%2810368356%29.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/e/ed/Blankets_of_NE_India_%2810368356%29.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/a/a5/Ceremonial_Textile_%28Kain_Sembagi%29_LACMA_M.91.184.650.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/Q9R97Jv3jJc",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 90,
        sales: 31,
        rating: "4.9"
    },
    {
        name: "Authentic Textiles - Ceremonial Textile (",
        category: "Textiles",
        price: 1912,
        description: "A stunning, 100% genuine handcrafted piece. Ceremonial Textile (Kain Sembagi) LACMA M.91.184.650. This item showcases the rich cultural heritage and generational craftsmanship.",
        stock: 5,
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Ceremonial_Textile_%28Kain_Sembagi%29_LACMA_M.91.184.650.jpg",
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/a/a5/Ceremonial_Textile_%28Kain_Sembagi%29_LACMA_M.91.184.650.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/2/24/A_traditional_Bagh_Print_craftsman_Mohammed_Bilal_Khatri_from_Bagh%2C_Madhya_Pradesh%2C_at_Surajkund_International_Crafts_Mela_2015.jpg"
        ],
        videoUrl: "https://www.youtube.com/embed/hB2g7T97yKw",
        isHandmadeVerified: true,
        handmadeAuthenticityScore: 99,
        sales: 29,
        rating: "4.3"
    }
];

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
