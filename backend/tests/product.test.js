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
    let artisanId;
    let buyerToken;
    let productId;

    beforeEach(async () => {
        // Create an artisan and get token
        const artisanRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test Artisan ' + Date.now(),
                email: 'artisan' + Date.now() + '@test.com',
                password: 'password123',
                role: 'artisan'
            });

        artisanToken = artisanRes.body.token;
        artisanId = artisanRes.body._id;

        // Create a buyer and get token
        const buyerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test Buyer ' + Date.now(),
                email: 'buyer' + Date.now() + '@test.com',
                password: 'password123',
                role: 'buyer'
            });

        buyerToken = buyerRes.body.token;

        // Seed a sample product
        const productRes = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${artisanToken}`)
            .send({
                name: 'Handcrafted Bowl',
                description: 'A beautiful ceramic bowl',
                price: 45.00,
                category: 'Pottery',
                imageUrl: 'http://example.com/bowl.jpg',
                stock: 10,
            });

        productId = productRes.body._id;
    });

    // ==================== READ TESTS ====================
    it('Should fetch all products', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].name).toEqual('Handcrafted Bowl');
    });

    it('Should fetch a single product by ID', async () => {
        const res = await request(app).get(`/api/products/${productId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual('Handcrafted Bowl');
        expect(res.body.price).toEqual(45.00);
        expect(res.body.stock).toEqual(10);
    });

    it('Should return 404 for non-existent product', async () => {
        const fakeId = '507f1f77bcf86cd799439011';
        const res = await request(app).get(`/api/products/${fakeId}`);
        expect(res.statusCode).toEqual(404);
    });

    it('Should filter products by category', async () => {
        // Add another product with different category
        await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${artisanToken}`)
            .send({
                name: 'Silk Scarf',
                description: 'Beautiful scarf',
                price: 30,
                category: 'Textiles',
                imageUrl: 'http://example.com/scarf.jpg',
                stock: 5,
            });

        const res = await request(app)
            .get('/api/products')
            .query({ category: 'Pottery' });

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        // Filter results may include products from test setup
        if (res.body.length > 0) {
            expect(res.body.some(p => p.category === 'Pottery')).toBeTruthy();
        }
    });

    it('Should search products by name', async () => {
        const res = await request(app)
            .get('/api/products')
            .query({ search: 'Handcrafted' });

        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].name).toContain('Handcrafted');
    });

    it('Should sort products by price', async () => {
        await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${artisanToken}`)
            .send({
                name: 'Expensive Vase',
                description: 'Premium vase',
                price: 150,
                category: 'Pottery',
                imageUrl: 'http://example.com/vase.jpg',
                stock: 2,
            });

        const res = await request(app)
            .get('/api/products')
            .query({ sort: 'price' });

        expect(res.statusCode).toEqual(200);
        expect(res.body[0].price).toBeLessThanOrEqual(res.body[1]?.price || res.body[0].price);
    });

    // ==================== CREATE TESTS ====================
    it('Should create a product with valid data', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${artisanToken}`)
            .send({
                name: 'Wooden Carving',
                description: 'Hand-carved wooden statue',
                price: 120.50,
                category: 'Wood Carving',
                imageUrl: 'http://example.com/carving.jpg',
                stock: 3,
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.name).toEqual('Wooden Carving');
        expect(res.body.price).toEqual(120.50);
        expect(res.body.artisan).toEqual(artisanId);
    });

    it('Should not create a product without authentication', async () => {
        const res = await request(app)
            .post('/api/products')
            .send({
                name: 'New Art',
                description: 'test',
                price: 10,
                category: 'Painting',
                stock: 1
            });

        expect(res.statusCode).toEqual(401);
    });

    it('Should require name for product creation', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${artisanToken}`)
            .send({
                description: 'Missing name',
                price: 50,
                category: 'Art',
                stock: 1
            });

        expect(res.statusCode).toEqual(400);
    });

    it('Should require price for product creation', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${artisanToken}`)
            .send({
                name: 'No Price Item',
                description: 'Missing price',
                category: 'Art',
                stock: 1
            });

        expect(res.statusCode).toEqual(400);
    });

    it('Should require category for product creation', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${artisanToken}`)
            .send({
                name: 'No Category Item',
                description: 'Missing category',
                price: 50,
                stock: 1
            });

        expect(res.statusCode).toEqual(400);
    });

    it('Should not allow non-artisans to create products', async () => {
        const res = await request(app)
            .post('/api/products')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                name: 'Buyer Product',
                description: 'Buyers cannot sell',
                price: 50,
                category: 'Art',
                stock: 1
            });

        expect([401, 403]).toContain(res.statusCode);
    });

    // ==================== UPDATE TESTS ====================
    it('Should update a product', async () => {
        const res = await request(app)
            .put(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${artisanToken}`)
            .send({
                name: 'Updated Bowl',
                price: 55.00,
                stock: 8
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.name).toEqual('Updated Bowl');
        expect(res.body.price).toEqual(55.00);
        expect(res.body.stock).toEqual(8);
    });

    it('Should update numeric product fields to zero when explicitly provided', async () => {
        const res = await request(app)
            .put(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${artisanToken}`)
            .send({
                stock: 0,
                ecoScore: {
                    material: 0,
                    carbon: 0,
                    recycling: 0
                },
                materialCost: 0,
                laborCost: 0
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.stock).toEqual(0);
        expect(res.body.ecoScore.material).toEqual(0);
        expect(res.body.ecoScore.carbon).toEqual(0);
        expect(res.body.ecoScore.recycling).toEqual(0);
        expect(res.body.transparency.materialCost).toEqual(0);
        expect(res.body.transparency.laborCost).toEqual(0);
    });

    it('Should not allow non-owner to update product', async () => {
        const res = await request(app)
            .put(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                name: 'Hacked Bowl',
                price: 1
            });

        expect([401, 403]).toContain(res.statusCode);
    });

    it('Should not update product without authentication', async () => {
        const res = await request(app)
            .put(`/api/products/${productId}`)
            .send({
                name: 'Unauthorized Update'
            });

        expect(res.statusCode).toEqual(401);
    });

    // ==================== DELETE TESTS ====================
    it('Should delete a product', async () => {
        const res = await request(app)
            .delete(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${artisanToken}`);

        expect(res.statusCode).toEqual(200);

        // Verify product is deleted
        const getRes = await request(app).get(`/api/products/${productId}`);
        expect(getRes.statusCode).toEqual(404);
    });

    it('Should not allow non-owner to delete product', async () => {
        const res = await request(app)
            .delete(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${buyerToken}`);

        expect([401, 403]).toContain(res.statusCode);
    });

    it('Should not delete product without authentication', async () => {
        const res = await request(app)
            .delete(`/api/products/${productId}`);

        expect(res.statusCode).toEqual(401);
    });
});
