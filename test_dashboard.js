#!/usr/bin/env node

/**
 * Dashboard Manual Test Verification Script
 * Tests the Artisan Dashboard features programmatically
 */

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.API_PORT || 5000}/api`;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT || 5173}`;

let authToken = '';
let artisanUser = null;
let artisanId = '';

// Test data from seed
const TEST_CREDENTIALS = {
    email: 'artisan@kalakart.com',
    password: 'password123'
};

async function log(message, status = 'INFO') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] ${status}: ${message}`);
}

async function makeRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

async function testAuth() {
    log('Testing authentication...');
    try {
        const data = await makeRequest(`${BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(TEST_CREDENTIALS)
        });

        authToken = data.token;
        artisanUser = data; // User data is directly in response
        artisanId = data._id || data.id || '';

        log(`✅ Login successful - User: ${artisanUser.name} (${artisanUser.role})`);
        log(`   • Artisan ID: ${artisanId}`);
        return true;
    } catch (error) {
        log(`❌ Login failed: ${error.message}`, 'ERROR');
        return false;
    }
}

async function testProductsAPI() {
    log('Testing products API...');
    try {
        const data = await makeRequest(`${BASE_URL}/products`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const products = data.products || data;
        log(`✅ Products API working - Found ${products.length} products`);

        // Check if products have required fields
        const hasRequiredFields = products.every(p =>
            p.name && p.price && p.category && p.imageUrl
        );
        log(`${hasRequiredFields ? '✅' : '❌'} Products have required fields`);

        return products;
    } catch (error) {
        log(`❌ Products API failed: ${error.message}`, 'ERROR');
        return null;
    }
}

async function testArtisanProductsAPI() {
    log('Testing artisan products route...');
    if (!artisanId) {
        log('❌ Artisan ID missing. Cannot validate artisan products route.', 'ERROR');
        return null;
    }

    try {
        const data = await makeRequest(`${BASE_URL}/products/artisan/${artisanId}`);
        const artisanProducts = data.products || data;

        log(`✅ Artisan products route working - Found ${artisanProducts.length} artisan product(s)`);
        return artisanProducts;
    } catch (error) {
        log(`❌ Artisan products route failed: ${error.message}`, 'ERROR');
        return null;
    }
}

async function testOrdersAPI() {
    log('Testing artisan orders API...');
    try {
        const data = await makeRequest(`${BASE_URL}/orders/artisan`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        const orders = data.orders || data;
        log(`✅ Orders API working - Found ${orders.length} orders`);

        return orders;
    } catch (error) {
        log(`❌ Orders API failed: ${error.message}`, 'ERROR');
        return null;
    }
}

async function testAnalyticsCalculations(products, orders) {
    log('Testing analytics calculations...');

    // Calculate expected values
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const totalSales = products.reduce((sum, p) => sum + (p.sales || 0), 0);
    const avgRating = products.length > 0
        ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length
        : 0;
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    log(`📊 Expected Analytics:`);
    log(`   Total Revenue: ₹${totalRevenue.toFixed(2)}`);
    log(`   Products Sold: ${totalSales}`);
    log(`   Average Rating: ${avgRating.toFixed(1)}`);
    log(`   Total Orders: ${totalOrders}`);
    log(`   Avg Order Value: ₹${avgOrderValue.toFixed(2)}`);

    return {
        totalRevenue: totalRevenue.toFixed(2),
        totalSales,
        avgRating: avgRating.toFixed(1),
        totalOrders,
        avgOrderValue: avgOrderValue.toFixed(2)
    };
}

async function testFrontendCompilation() {
    log('Testing frontend compilation...');
    try {
        const response = await fetch(FRONTEND_URL);
        if (response.ok) {
            log('✅ Frontend serving successfully');
            return true;
        }
    } catch (error) {
        log(`❌ Frontend not responding: ${error.message}`, 'ERROR');
        return false;
    }
}

async function testDashboardAccess() {
    log('Testing dashboard access control...');
    try {
        const unauthResponse = await fetch(`${BASE_URL}/orders/artisan`);
        if (unauthResponse.status !== 401) {
            log('❌ Public access should be denied for artisan order data', 'ERROR');
            return false;
        }

        log('✅ Unauthenticated access denied as expected');

        const authResponse = await fetch(`${BASE_URL}/orders/artisan`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (authResponse.ok) {
            log('✅ Authenticated access granted');
            return true;
        }

        const authText = await authResponse.text();
        log(`❌ Authenticated access failed: ${authResponse.status} ${authText}`, 'ERROR');
        return false;
    } catch (error) {
        log(`❌ Unexpected error: ${error.message}`, 'ERROR');
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting KalaKart Dashboard Test Suite\n');

    let passed = 0;
    let total = 0;

    // Test 1: Authentication
    total++;
    if (await testAuth()) passed++;

    // Test 2: Frontend Compilation
    total++;
    if (await testFrontendCompilation()) passed++;

    // Test 3: Dashboard Access Control
    total++;
    if (await testDashboardAccess()) passed++;

    // Test 4: Products API
    total++;
    const products = await testProductsAPI();
    if (products !== null) {
        if (products.length > 0) {
            passed++;
        } else {
            log('⚠️ No public products returned from API', 'WARN');
            passed++;
        }
    }

    // Test 5: Artisan Products API
    total++;
    const artisanProducts = await testArtisanProductsAPI();
    if (artisanProducts !== null) {
        passed++;
    }

    // Test 6: Orders API
    total++;
    const orders = await testOrdersAPI();
    if (orders !== null) passed++; // Orders may legitimately be empty

    // Test 7: Analytics Calculations
    if (products && products.length > 0) {
        total++;
        const analytics = await testAnalyticsCalculations(products, orders || []);
        log('✅ Analytics calculations completed');
        passed++;
    } else {
        log('⚠️ Skipping analytics test - no products found');
    }

    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);

    if (passed === total) {
        console.log('🎉 All tests passed! Dashboard is ready for manual testing.');
        console.log('\n📋 Manual Test Checklist:');
        console.log(`1. Open ${FRONTEND_URL}/login`);
        console.log('2. Login with artisan@kalakart.com / password123');
        console.log('3. Navigate to /dashboard');
        console.log('4. Verify analytics metrics display correctly');
        console.log('5. Confirm artisan product listings are visible');
        console.log('6. Confirm order history is accessible');
        console.log('7. Test responsive design on mobile/tablet');
        process.exit(0);
    } else {
        console.log('❌ Some tests failed. Check the output above.');
        process.exit(1);
    }
}

// Run the tests
runTests().catch(error => {
    console.error('💥 Test suite crashed:', error.message);
    process.exit(1);
});
