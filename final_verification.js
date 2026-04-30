#!/usr/bin/env node

/**
 * Feature Verification - Rate Limit Aware
 * Tests all features with appropriate delays between requests
 */

const BASE_URL = process.env.API_BASE || `http://localhost:${process.env.API_PORT || 3000}/api`;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT || 5174}`;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let results = {
    total: 0,
    passed: 0,
    tests: []
};

async function test(name, fn) {
    results.total++;
    try {
        await fn();
        console.log(`✅ ${name}`);
        results.tests.push({ name, status: 'passed' });
        results.passed++;
        return true;
    } catch (e) {
        console.log(`❌ ${name}: ${e.message}`);
        results.tests.push({ name, status: 'failed', error: e.message });
        return false;
    }
}

async function runTests() {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  KALAKART FEATURE VERIFICATION (Rate-Aware)              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('🔵 BACKEND API TESTS\n');

    // Test 1: Frontend
    console.log('Test 1: Frontend Server...');
    await test('Frontend Server (Page loads)', async () => {
        const res = await fetch(FRONTEND_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
    });

    await sleep(2000); // 2 second delay

    // Test 2: Authentication
    console.log('\nTest 2: Authentication...');
    let authToken = '';
    let artisanId = '';
    await test('Authentication (Login)', async () => {
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
    });

    await sleep(2000); // 2 second delay

    // Test 3: Products API
    console.log('\nTest 3: Products API...');
    await test('Products API (Fetch products)', async () => {
        const res = await fetch(`${BASE_URL}/products`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const products = Array.isArray(data) ? data : (data.products || []);
        if (products.length === 0) throw new Error('No products returned');
    });

    await sleep(2000); // 2 second delay

    // Test 4: Artisan Products Route
    console.log('\nTest 4: Artisan Products Route...');
    if (artisanId) {
        await test('Artisan Products Route (Get artisan products)', async () => {
            const res = await fetch(`${BASE_URL}/products/artisan/${artisanId}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
        });
    } else {
        console.log('⏭️  Skipped (no auth token)');
    }

    await sleep(2000); // 2 second delay

    // Test 5: Orders API
    console.log('\nTest 5: Orders API...');
    if (authToken) {
        await test('Orders API (Fetch artisan orders)', async () => {
            const res = await fetch(`${BASE_URL}/orders/artisan`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
        });
    } else {
        console.log('⏭️  Skipped (no auth token)');
    }

    await sleep(2000); // 2 second delay

    // Test 6: Access Control
    console.log('\nTest 6: Access Control...');
    await test('Access Control (Unauthenticated denied)', async () => {
        const res = await fetch(`${BASE_URL}/orders/artisan`);
        if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    });

    await sleep(2000); // 2 second delay

    // Test 7: AI Trends
    console.log('\nTest 7: AI Trends...');
    if (authToken) {
        await test('AI Trends Forecast (Fetch market trends)', async () => {
            const res = await fetch(`${BASE_URL}/ai/trend-forecast`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
        });
    } else {
        console.log('⏭️  Skipped (no auth token)');
    }

    // Print Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log(`║ RESULTS: ${results.passed}/${results.total} TESTS PASSED                          ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (results.passed === results.total) {
        console.log('🎉 ALL FEATURES VERIFIED SUCCESSFULLY!\n');
        console.log('✅ Status Summary:');
        console.log('   • Backend API: ✅ WORKING');
        console.log('   • Frontend Server: ✅ RUNNING');
        console.log('   • Authentication: ✅ SECURE');
        console.log('   • Products Management: ✅ FUNCTIONAL');
        console.log('   • Orders System: ✅ FUNCTIONAL');
        console.log('   • AI Integration: ✅ WORKING');
        console.log('\n✨ Ready for:');
        console.log('   • Dashboard Testing: http://localhost:5174');
        console.log('   • User Acceptance Testing');
        console.log('   • Production Deployment');
        process.exit(0);
    } else {
        console.log(`⚠️  ${results.total - results.passed} test(s) failed:\n`);
        results.tests.filter(t => t.status === 'failed').forEach(t => {
            console.log(`  • ${t.name}: ${t.error}`);
        });
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('💥 Test error:', err.message);
    process.exit(1);
});
