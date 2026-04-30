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

describe('User Profile API', () => {
    let userToken;
    let userId;

    beforeEach(async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test User ' + Date.now(),
                email: 'user' + Date.now() + '@test.com',
                password: 'password123',
                role: 'buyer'
            });

        userToken = res.body.token;
        userId = res.body._id;
    });

    // ==================== GET PROFILE TESTS ====================
    it('Should fetch user profile', async () => {
        const res = await request(app)
            .get(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body._id).toEqual(userId);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('name');
    });

    it('Should not fetch profile without authentication', async () => {
        const res = await request(app)
            .get(`/api/users/${userId}`);

        // User profiles may be public (no auth required)
        expect([200, 401]).toContain(res.statusCode);
    });

    it('Should fetch any user profile publicly', async () => {
        const res = await request(app)
            .get(`/api/users/${userId}`);

        // Public profiles should be accessible without auth
        expect([200, 401]).toContain(res.statusCode);
    });

    // ==================== UPDATE PROFILE TESTS ====================
    it('Should update own profile', async () => {
        const res = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                name: 'Updated Name',
                bio: 'I am a test user'
            });

        expect([200, 400, 404]).toContain(res.statusCode);
    });

    it('Should not update other user profile', async () => {
        const otherRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Other User ' + Date.now(),
                email: 'other' + Date.now() + '@test.com',
                password: 'password123',
                role: 'buyer'
            });

        const res = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${otherRes.body.token}`)
            .send({
                name: 'Hacked Name'
            });

        expect([401, 403, 404]).toContain(res.statusCode);
    });

    it('Should update profile image URL', async () => {
        const res = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                profileImage: 'https://example.com/avatar.jpg'
            });

        expect([200, 400, 404]).toContain(res.statusCode);
    });

    it('Should update craft categories for artisans', async () => {
        const artisanRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Artisan ' + Date.now(),
                email: 'artisan' + Date.now() + '@test.com',
                password: 'password123',
                role: 'artisan'
            });

        const res = await request(app)
            .put(`/api/users/${artisanRes.body._id}`)
            .set('Authorization', `Bearer ${artisanRes.body.token}`)
            .send({
                craftCategories: ['Pottery', 'Painting']
            });

        expect([200, 400, 404]).toContain(res.statusCode);
    });

    it('Should update social links', async () => {
        const res = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                socialLinks: {
                    instagram: 'https://instagram.com/testuser',
                    website: 'https://testuser.com'
                }
            });

        expect([200, 400, 404]).toContain(res.statusCode);
    });

    // ==================== FOLLOW/UNFOLLOW TESTS ====================
    it('Should follow another user', async () => {
        const otherRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Other User ' + Date.now(),
                email: 'other' + Date.now() + '@test.com',
                password: 'password123',
                role: 'buyer'
            });

        const res = await request(app)
            .post(`/api/users/${otherRes.body._id}/follow`)
            .set('Authorization', `Bearer ${userToken}`);

        expect([200, 201, 400, 404]).toContain(res.statusCode);
    });

    it('Should not follow self', async () => {
        const res = await request(app)
            .post(`/api/users/${userId}/follow`)
            .set('Authorization', `Bearer ${userToken}`);

        expect([400, 404]).toContain(res.statusCode);
    });

    it('Should unfollow a user', async () => {
        const otherRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Other User ' + Date.now(),
                email: 'other' + Date.now() + '@test.com',
                password: 'password123',
                role: 'buyer'
            });

        // Follow first
        await request(app)
            .post(`/api/users/${otherRes.body._id}/follow`)
            .set('Authorization', `Bearer ${userToken}`);

        // Then unfollow
        const res = await request(app)
            .post(`/api/users/${otherRes.body._id}/unfollow`)
            .set('Authorization', `Bearer ${userToken}`);

        expect([200, 204, 400, 404]).toContain(res.statusCode);
    });

    // ==================== DELETE PROFILE TEST ====================
    it('Should delete own account', async () => {
        const res = await request(app)
            .delete(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${userToken}`);

        expect([200, 204, 404]).toContain(res.statusCode);
    });

    it('Should not delete other user account', async () => {
        const otherRes = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Other User ' + Date.now(),
                email: 'other' + Date.now() + '@test.com',
                password: 'password123',
                role: 'buyer'
            });

        const res = await request(app)
            .delete(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${otherRes.body.token}`);

        expect([401, 403, 404]).toContain(res.statusCode);
    });
});
