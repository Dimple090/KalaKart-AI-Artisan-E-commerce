#!/usr/bin/env node

/**
 * Comprehensive Feature Verification Script
 * Tests all backend and frontend features
 */

const BASE_URL = process.env.API_BASE || `http://localhost:${process.env.API_PORT || 3000}/api`;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT || 5174}`;

let testResults = {
    backend: {
        auth: false,
        products: false,
        orders: false,
        artisanProducts: false,
        analytics: false,
        accessControl: false
    },
    frontend: {
        serving: false,
        ready: false
    },
    integration: {
        createProduct: false,
        fetchTrends: false,
        analytics: false
    },
    summary: {
        total: 0,
        passed: 0,
        failed: 0
    }
};

async function test(name, fn) {
    try {
        await fn();
        console.log(`✅ ${name}`);
        return true;
    } catch (e) {
        console.log(`❌ ${name}: ${e.message}`);
        return false;
    }
}

async function runTests() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     COMPREHENSIVE KALAKART FEATURE VERIFICATION           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('🔵 BACKEND API TESTS\n');

    // Test 1: Authentication
    let authToken = '';
    let artisanId = '';
    testResults.summary.total++;
    if (await test('1. Authentication (Login)', async () => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'artisan@kalakart.com',
                password: 'password123'
            })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.token) throw new Error('No token in response');
        authToken = data.token;
        artisanId = data._id;
    })) {
        testResults.backend.auth = true;
        testResults.summary.passed++;
    } else {
        testResults.summary.failed++;
    }

    // Test 2: Products API
    testResults.summary.total++;
    if (await test('2. Products API (Fetch products)', async () => {
        const res = await fetch(`${BASE_URL}/products`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const products = Array.isArray(data) ? data : (data.products || []);
        if (products.length === 0) throw new Error('No products returned');
    })) {
        testResults.backend.products = true;
        testResults.summary.passed++;
    } else {
        testResults.summary.failed++;
    }

    // Test 3: Artisan Products API
    testResults.summary.total++;
    if (await test('3. Artisan Products Route (Get artisan products)', async () => {
        const res = await fetch(`${BASE_URL}/products/artisan/${artisanId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
    })) {
        testResults.backend.artisanProducts = true;
        testResults.summary.passed++;
    } else {
        testResults.summary.failed++;
    }

    // Test 4: Orders API
    testResults.summary.total++;
    if (await test('4. Orders API (Fetch artisan orders)', async () => {
        const res = await fetch(`${BASE_URL}/orders/artisan`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
    })) {
        testResults.backend.orders = true;
        testResults.summary.passed++;
    } else {
        testResults.summary.failed++;
    }

    // Test 5: Access Control
    testResults.summary.total++;
    if (await test('5. Access Control (Unauthenticated request denied)', async () => {
        const res = await fetch(`${BASE_URL}/orders/artisan`);
        if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    })) {
        testResults.backend.accessControl = true;
        testResults.summary.passed++;
    } else {
        testResults.summary.failed++;
    }

    console.log('\n🔵 FRONTEND TESTS\n');

    // Test 6: Frontend Serving
    testResults.summary.total++;
    if (await test('6. Frontend Server (Page loads)', async () => {
        const res = await fetch(FRONTEND_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    })) {
        testResults.frontend.serving = true;
        testResults.summary.passed++;
    } else {
        testResults.summary.failed++;
    }

    console.log('\n🔵 INTEGRATION TESTS\n');

    // Test 7: Product Creation
    testResults.summary.total++;
    if (await test('7. Product Creation (Create new product)', async () => {
        const testEmail = `test${Date.now()}@test.com`;
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Integration Test User',
                email: testEmail,
                password: 'password123',
                role: 'artisan'
            })
        });
        if (!regRes.ok) throw new Error(`Registration failed: ${regRes.status}`);
        const regData = await regRes.json();
        const testToken = regData.token;

        const prodRes = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${testToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Test Product',
                description: 'Integration test product',
                price: 1000,
                category: 'Test',
                imageUrl: 'https://via.placeholder.com/300x300',
                stock: 10
            })
        });
        if (!prodRes.ok) throw new Error(`Product creation failed: ${prodRes.status}`);
    })) {
        testResults.integration.createProduct = true;
        testResults.summary.passed++;
    } else {
        testResults.summary.failed++;
    }

    // Test 8: Market Trends (AI Integration)
    testResults.summary.total++;
    if (await test('8. AI Trends Forecast (Fetch market trends)', async () => {
        const res = await fetch(`${BASE_URL}/ai/trend-forecast`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
    })) {
        testResults.integration.fetchTrends = true;
        testResults.summary.passed++;
    } else {
        testResults.summary.failed++;
    }

    // Test 9: Analytics Calculation
    testResults.summary.total++;
    if (await test('9. Analytics Pipeline (Calculate metrics)', async () => {
        const res = await fetch(`${BASE_URL}/products`);
        if (!res.ok) throw new Error(`Products fetch failed: ${res.status}`);
        const data = await res.json();
        const products = Array.isArray(data) ? data : (data.products || []);
        
        const ordRes = await fetch(`${BASE_URL}/orders/artisan`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!ordRes.ok) throw new Error(`Orders fetch failed: ${ordRes.status}`);
        const ordData = await ordRes.json();
        const orders = Array.isArray(ordData) ? ordData : (ordData.orders || []);
        
        // Calculate analytics
        const revenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
        const avgRating = products.length > 0 ? products.reduce((s, p) => s + (p.rating || 0), 0) / products.length : 0;
    })) {
        testResults.integration.analytics = true;
        testResults.summary.passed++;
    } else {
        testResults.summary.failed++;
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log(`║ RESULTS: ${testResults.summary.passed}/${testResults.summary.total} TESTS PASSED                          ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 TEST BREAKDOWN:\n');
    console.log('Backend APIs:');
    console.log(`  • Authentication: ${testResults.backend.auth ? '✅' : '❌'}`);
    console.log(`  • Products: ${testResults.backend.products ? '✅' : '❌'}`);
    console.log(`  • Artisan Products: ${testResults.backend.artisanProducts ? '✅' : '❌'}`);
    console.log(`  • Orders: ${testResults.backend.orders ? '✅' : '❌'}`);
    console.log(`  • Access Control: ${testResults.backend.accessControl ? '✅' : '❌'}`);

    console.log('\nFrontend:');
    console.log(`  • Server Running: ${testResults.frontend.serving ? '✅' : '❌'}`);

    console.log('\nIntegration:');
    console.log(`  • Product Creation: ${testResults.integration.createProduct ? '✅' : '❌'}`);
    console.log(`  • AI Trends: ${testResults.integration.fetchTrends ? '✅' : '❌'}`);
    console.log(`  • Analytics: ${testResults.integration.analytics ? '✅' : '❌'}`);

    if (testResults.summary.passed === testResults.summary.total) {
        console.log('\n🎉 ALL FEATURES VERIFIED SUCCESSFULLY!\n');
        console.log('✨ The application is ready for:');
        console.log('   • User testing');
        console.log('   • Dashboard verification at http://localhost:5174');
        console.log('   • Product creation and management');
        console.log('   • Analytics and reporting');
        process.exit(0);
    } else {
        console.log(`\n⚠️  ${testResults.summary.failed} test(s) failed. See details above.\n`);
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('💥 Test suite error:', err.message);
    process.exit(1);
});
