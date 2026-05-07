process.env.GEMINI_API_KEY = '';

const request = require('supertest');
const app = require('../server');
const db = require('./db');

beforeAll(async () => {
    await db.connectDB();
});

afterAll(async () => {
    await db.closeDB();
});

afterEach(async () => {
    await db.clearDB();
});

const registerUser = (role) => request(app)
    .post('/api/auth/register')
    .send({
        name: `AI ${role} ${Date.now()} ${Math.random()}`,
        email: `ai-${role}-${Date.now()}-${Math.random()}@test.com`,
        password: 'password123',
        role
    });

const createProduct = async (token, overrides = {}) => {
    const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: 'Blue Studio Bowl',
            description: 'Hand-thrown ceramic bowl with a blue glaze.',
            price: 1200,
            category: 'Pottery',
            imageUrl: 'http://example.com/bowl.jpg',
            stock: 5,
            ...overrides
        });
    return res.body;
};

describe('AI API contracts', () => {
    let artisanToken;
    let product;

    beforeEach(async () => {
        const artisanRes = await registerUser('artisan');
        artisanToken = artisanRes.body.token;
        product = await createProduct(artisanToken);
    });

    it('returns dashboard AI data in frontend-compatible shapes', async () => {
        const trendRes = await request(app)
            .get('/api/ai/trend-forecast')
            .set('Authorization', `Bearer ${artisanToken}`);
        expect(trendRes.statusCode).toEqual(200);
        expect(Array.isArray(trendRes.body.trends)).toBe(true);

        const nameRes = await request(app)
            .post('/api/ai/product-name')
            .set('Authorization', `Bearer ${artisanToken}`)
            .send({ category: 'Pottery', description: product.description });
        expect(nameRes.statusCode).toEqual(200);
        expect(Array.isArray(nameRes.body.suggestions)).toBe(true);

        const priceRes = await request(app)
            .post('/api/ai/predict-price')
            .set('Authorization', `Bearer ${artisanToken}`)
            .send({ category: 'Pottery', material_cost: 200, labor_hours: 4 });
        expect(priceRes.statusCode).toEqual(200);
        expect(priceRes.body.suggestedPrice).toBeGreaterThan(0);
        expect(priceRes.body.suggested_price).toEqual(priceRes.body.suggestedPrice);

        const verifyRes = await request(app)
            .post('/api/ai/verify-handmade')
            .set('Authorization', `Bearer ${artisanToken}`)
            .send({ name: product.name, description: product.description });
        expect(verifyRes.statusCode).toEqual(200);
        expect(verifyRes.body).toHaveProperty('isHandmadeVerified');
        expect(verifyRes.body.fullData).toHaveProperty('verificationResult');

        const captionRes = await request(app)
            .post('/api/ai/social-caption')
            .set('Authorization', `Bearer ${artisanToken}`)
            .send({ productName: product.name, category: product.category, price: product.price });
        expect(captionRes.statusCode).toEqual(200);
        expect(captionRes.body).toHaveProperty('instagram');
        expect(captionRes.body).toHaveProperty('twitter');
    });

    it('supports buyer-facing AI helpers without live AI credentials', async () => {
        const giftRes = await request(app)
            .post('/api/ai/gift-finder')
            .send({ persona: 'A friend who loves pottery and quiet home decor' });
        expect(giftRes.statusCode).toEqual(200);
        expect(giftRes.body).toHaveProperty('reasoning');
        expect(Array.isArray(giftRes.body.products)).toBe(true);

        const styleRes = await request(app)
            .post('/api/ai/style-match')
            .send({ wishlistItems: [{ _id: product._id, category: product.category }] });
        expect(styleRes.statusCode).toEqual(200);
        expect(styleRes.body).toHaveProperty('styleLabel');
        expect(Array.isArray(styleRes.body.products)).toBe(true);

        const bundleRes = await request(app)
            .post('/api/ai/bundle-advisor')
            .send({ cartItems: [{ _id: product._id, category: product.category }] });
        expect(bundleRes.statusCode).toEqual(200);
        expect(Array.isArray(bundleRes.body.bundles)).toBe(true);

        const tutorialRes = await request(app)
            .post('/api/ai/craft-tutorial')
            .send({ prompt: 'Clay lamp', skillLevel: 'Beginner' });
        expect(tutorialRes.statusCode).toEqual(200);
        expect(tutorialRes.body).toHaveProperty('craftName');
        expect(Array.isArray(tutorialRes.body.steps)).toBe(true);

        const qaRes = await request(app)
            .post('/api/ai/product-qa')
            .send({ question: 'How do I care for this?', productName: product.name });
        expect(qaRes.statusCode).toEqual(200);
        expect(qaRes.body).toHaveProperty('answer');
    });

    it('saves and removes generated craft ideas for authenticated users', async () => {
        const idea = {
            craftName: 'Handmade Clay Lamp',
            skillLevel: 'Beginner',
            materialsRequired: ['Clay', 'Paint'],
            steps: ['Shape', 'Dry', 'Paint'],
            estimatedTime: '2 hours',
            creativeTip: 'Use soft patterns',
            sellingIdea: 'Photograph with warm light'
        };

        const createRes = await request(app)
            .post('/api/ai/saved-ideas')
            .set('Authorization', `Bearer ${artisanToken}`)
            .send(idea);
        expect(createRes.statusCode).toEqual(201);

        const listRes = await request(app)
            .get('/api/ai/saved-ideas')
            .set('Authorization', `Bearer ${artisanToken}`);
        expect(listRes.statusCode).toEqual(200);
        expect(listRes.body).toHaveLength(1);

        const deleteRes = await request(app)
            .delete(`/api/ai/saved-ideas/${createRes.body._id}`)
            .set('Authorization', `Bearer ${artisanToken}`);
        expect(deleteRes.statusCode).toEqual(200);
    });
});
