const request = require('supertest');
const app = require('../server');
const db = require('./db');
const User = require('../models/User');
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

describe('User Authentication API', () => {
    // ==================== REGISTRATION TESTS ====================
    it('Should register a new user with valid data', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test Artist',
                email: 'artist@test.com',
                password: 'password123',
                role: 'artisan'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toEqual('artist@test.com');
        expect(res.body.role).toEqual('artisan');
        expect(res.body.name).toEqual('Test Artist');
    });

    it('Should register with default role "buyer" if not specified', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Buyer User',
                email: 'buyer@test.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.role).toEqual('buyer');
    });

    it('Should not register without a name', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'noname@test.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(400);
    });

    it('Should not register without an email', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'No Email User',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(400);
    });

    it('Should not register without a password', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'No Password User',
                email: 'nopass@test.com'
            });

        expect(res.statusCode).toEqual(400);
    });

    it('Should not register with an invalid email format', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Invalid Email User',
                email: 'not-an-email',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(400);
    });

    it('Should not register a user with an existing email', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test Artist',
                email: 'artist@test.com',
                password: 'password123',
                role: 'artisan'
            });

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Another Artist',
                email: 'artist@test.com',
                password: 'password321',
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('User already exists');
    });

    it('Should hash the password before storing', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Hash Test User',
                email: 'hash@test.com',
                password: 'myPlaintextPassword'
            });

        const user = await User.findOne({ email: 'hash@test.com' });
        expect(user.password).not.toEqual('myPlaintextPassword');
        // Password should be hashed (bcryptjs hash)
        expect(user.password.length).toBeGreaterThan(20);
    });

    // ==================== LOGIN TESTS ====================
    it('Should login an existing user with correct credentials', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Login User',
                email: 'login@test.com',
                password: 'password123',
            });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'login@test.com',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.name).toEqual('Login User');
        expect(res.body.email).toEqual('login@test.com');
    });

    it('Should reject login with wrong password', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User',
                email: 'test@test.com',
                password: 'correctpassword'
            });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
                password: 'wrongpassword',
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('Invalid email or password');
    });

    it('Should reject login for non-existent email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@test.com',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('Invalid email or password');
    });

    it('Should not login without email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                password: 'password123',
            });

        expect(res.statusCode).toEqual(400);
    });

    it('Should not login without password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@test.com',
            });

        expect(res.statusCode).toEqual(400);
    });

    it('Should return a valid JWT token on login', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'JWT User',
                email: 'jwt@test.com',
                password: 'password123'
            });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'jwt@test.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.token).toBeTruthy();

        // Verify JWT is valid
        const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET || 'your_jwt_secret');
        expect(decoded.id).toBeTruthy();
    });

    // ==================== MULTIPLE ROLES TEST ====================
    it('Should support multiple user roles', async () => {
        const artisanRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Artisan',
                email: 'artisan@test.com',
                password: 'password123',
                role: 'artisan'
            });

        const buyerRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Buyer',
                email: 'buyer@test.com',
                password: 'password123',
                role: 'buyer'
            });

        expect(artisanRes.body.role).toEqual('artisan');
        expect(buyerRes.body.role).toEqual('buyer');
    });
});
