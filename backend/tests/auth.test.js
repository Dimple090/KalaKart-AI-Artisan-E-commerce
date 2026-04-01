const request = require('supertest');
const app = require('../server');
const db = require('./db');
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

describe('User Authentication API', () => {
    it('Should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test Artist',
                email: 'artist@test.com',
                password: 'password123',
                role: 'artisan'
            });

        console.log("DEBUG RESPONSE BODY:", res.body);
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('token');
        expect(res.body.email).toEqual('artist@test.com');
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

        if (res.statusCode !== 400) console.log("TEST 2 ERROR:", res.body);
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('User already exists');
    });

    it('Should login an existing user', async () => {
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
    });

    it('Should reject invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'fake@test.com',
                password: 'wrongpassword',
            });

        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toEqual('Invalid email or password');
    });
});
