const request = require('supertest');
const app = require('../server');
const db = require('./db');
const Product = require('../models/Product');
const User = require('../models/User');

beforeAll(async () => {
    await db.connectDB();
});

afterAll(async () => {
    await db.closeDB();
});

afterEach(async () => {
    await db.clearDB();
});

describe('Product API', () => {
    let artisanToken;

    beforeEach(async () => {
        // Create an artisan and log them in to get a token
        const userRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test Artisan ' + Date.now(), // Ensure unique email and name
                email: 'artisan' + Date.now() + '@test.com',
                password: 'password123',
                role: 'artisan'
            });

        if (userRes.statusCode !== 201) {
            console.log("BeforeEach Register Error:", userRes.body);
        }

        artisanToken = userRes.body.token;

        // Seed a sample product
        await Product.create({
            name: 'Handcrafted Bowl',
            description: 'A beautiful ceramic bowl',
            price: 45,
            category: 'Pottery',
            imageUrl: 'http://example.com/bowl.jpg',
            stock: 10,
            artisan: userRes.body._id,
        });
    });

    it('Should fetch all products', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toEqual(1);
        expect(res.body[0].name).toEqual('Handcrafted Bowl');
    });

    it('Should fetch a single product by ID', async () => {
        const products = await request(app).get('/api/products');
        const productId = products.body[0]._id;

        const res = await request(app).get(`/api/products/${productId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual('Handcrafted Bowl');
    });

    it('Should fail to create a product without an artisan token', async () => {
        const res = await request(app)
            .post('/api/products')
            .send({
                name: 'New Art',
                description: 'test',
                price: 10,
                category: 'Painting',
                stock: 1
            });

        // Without auth token, it should be 401
        expect(res.statusCode).toEqual(401);
    });
});
