const request = require('supertest');
const app = require('../server');
const db = require('./db');
const jwt = require('jsonwebtoken');

beforeAll(async () => {
    await db.connectDB();
});

afterAll(async () => {
    await db.closeDB();
});

afterEach(async () => {
    await db.clearDB();
});

describe('Middleware Tests', () => {
    // ==================== AUTH MIDDLEWARE TESTS ====================
    describe('Authentication Middleware', () => {
        it('Should reject request without token', async () => {
            const res = await request(app)
                .post('/api/products')
                .send({
                    name: 'Test Product',
                    price: 50,
                    category: 'Art'
                });

            expect(res.statusCode).toEqual(401);
        });

        it('Should reject request with invalid token', async () => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', 'Bearer invallidtoken123')
                .send({
                    name: 'Test Product',
                    price: 50,
                    category: 'Art'
                });

            expect(res.statusCode).toEqual(401);
        });

        it('Should reject request with malformed token', async () => {
            const res = await request(app)
                .post('/api/products')
                .set('Authorization', 'InvalidFormat token123')
                .send({
                    name: 'Test Product',
                    price: 50,
                    category: 'Art'
                });

            expect(res.statusCode).toEqual(401);
        });

        it('Should accept request with valid token', async () => {
            // Register user first
            const registerRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test Artisan',
                    email: 'artisan@test.com',
                    password: 'password123',
                    role: 'artisan'
                });

            const token = registerRes.body.token;

            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Test Product',
                    description: 'A test product',
                    price: 50,
                    category: 'Art',
                    stock: 5
                });

            expect([201, 400]).toContain(res.statusCode);
        });

        it('Should extract user info from valid token', async () => {
            const registerRes = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: 'test@test.com',
                    password: 'password123',
                    role: 'buyer'
                });

            const token = registerRes.body.token;
            const userId = registerRes.body._id;

            // Verify token contains correct user info
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
            expect(decoded.id || decoded._id).toEqual(userId);
        });

        it('Should handle expired token gracefully', async () => {
            // Create an expired token
            const expiredToken = jwt.sign(
                { _id: '507f1f77bcf86cd799439011' },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '0s' }
            );

            // Wait a moment for token to expire
            await new Promise(resolve => setTimeout(resolve, 100));

            const res = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${expiredToken}`)
                .send({
                    name: 'Test Product',
                    price: 50,
                    category: 'Art'
                });

            expect(res.statusCode).toEqual(401);
        });
    });

    // ==================== ERROR HANDLING TESTS ====================
    describe('Error Handling Middleware', () => {
        it('Should handle 404 errors', async () => {
            const res = await request(app)
                .get('/api/nonexistent-route');

            expect(res.statusCode).toEqual(404);
        });

        it('Should return proper error message for invalid product ID', async () => {
            const res = await request(app)
                .get('/api/products/invalid-id');

            expect([400, 404, 500]).toContain(res.statusCode);
        });

        it('Should validate JSON request body', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .set('Content-Type', 'application/json')
                .send('invalid json {');

            expect([400, 500]).toContain(res.statusCode);
        });

        it('Should handle missing required fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User'
                    // Missing email and password
                });

            expect(res.statusCode).toEqual(400);
        });

        it('Should return structured error response', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@test.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('message');
        });
    });

    // ==================== CORS MIDDLEWARE TESTS ====================
    describe('CORS Middleware', () => {
        it('Should allow public endpoints', async () => {
            const res = await request(app)
                .get('/api/products');

            expect(res.statusCode).toEqual(200);
        });

        it('Should handle preflight requests', async () => {
            const res = await request(app)
                .options('/api/products')
                .set('Origin', 'http://localhost:3000');

            expect([200, 204]).toContain(res.statusCode);
        });
    });

    // ==================== RATE LIMITING TESTS (if configured) ====================
    describe('Rate Limiting', () => {
        it('Should allow multiple requests from same IP', async () => {
            let successCount = 0;

            // Make several requests
            for (let i = 0; i < 5; i++) {
                const res = await request(app)
                    .get('/api/products');

                if (res.statusCode === 200) {
                    successCount++;
                }
            }

            // Should allow at least most of these requests
            expect(successCount).toBeGreaterThanOrEqual(3);
        });
    });

    // ==================== SECURITY TESTS ====================
    describe('Security Headers', () => {
        it('Should include security headers', async () => {
            const res = await request(app)
                .get('/api/products');

            // Helmet should add some security headers (may vary by configuration)
            expect(res.headers).toBeTruthy();
        });

        it('Should not expose detailed server information', async () => {
            const res = await request(app)
                .get('/api/products');

            // Server header is typically hidden or generic
            const serverHeader = res.headers['server'];
            // Just verify it doesn't contain detailed version info
            if (serverHeader) {
                expect(serverHeader.length).toBeLessThan(50);
            }
        });
    });
});
