#!/usr/bin/env node

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.API_PORT || 5000}/api`;

const TEST_CREDENTIALS = {
    email: 'artisan@kalakart.com',
    password: 'password123'
};

async function log(message, status = 'INFO') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`[${timestamp}] ${status}: ${message}`);
}

async function makeRequest(url, options = {}) {
    const { headers, ...rest } = options;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
        ...rest
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${text}`);
    }

    return response.json();
}

async function runVerification() {
    log('🚀 Starting Radical Transparency Edit Verification');

    try {
        // 1. Login
        log('Logging in...');
        const loginData = await makeRequest(`${BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(TEST_CREDENTIALS)
        });
        const token = loginData.token;
        const artisanId = loginData._id;
        log('✅ Login successful');

        // 2. Fetch an existing product
        log('Fetching artisan products...');
        const products = await makeRequest(`${BASE_URL}/products/artisan/${artisanId}`);
        if (products.length === 0) {
            log('❌ No products found for this artisan. Please seed or create a product first.', 'ERROR');
            return;
        }
        const product = products[0];
        log(`✅ Found product: ${product.name} (${product._id})`);

        // 3. Update the product with transparency costs
        log('Updating product transparency costs...');
        const updateData = {
            materialCost: 450,
            laborCost: 1200
        };
        const updatedProduct = await makeRequest(`${BASE_URL}/products/${product._id}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify(updateData)
        });

        if (updatedProduct.transparency && 
            updatedProduct.transparency.materialCost === 450 && 
            updatedProduct.transparency.laborCost === 1200) {
            log('✅ Backend update successful - Transparency costs saved correctly');
        } else {
            log('❌ Backend update failed - Transparency costs not saved correctly', 'ERROR');
            console.log('Updated product:', JSON.stringify(updatedProduct.transparency, null, 2));
            return;
        }

        // 4. Verify persistence
        log('Verifying persistence...');
        const refreshedProduct = await makeRequest(`${BASE_URL}/products/${product._id}`);
        if (refreshedProduct.transparency && 
            refreshedProduct.transparency.materialCost === 450 && 
            refreshedProduct.transparency.laborCost === 1200) {
            log('✅ Persistence verified');
        } else {
            log('❌ Persistence check failed', 'ERROR');
            return;
        }

        log('🎉 ALL BACKEND VERIFICATIONS PASSED!');
        log('The Radical Transparency edit feature is working correctly on the server.');

    } catch (error) {
        log(`💥 Verification failed: ${error.message}`, 'ERROR');
    }
}

runVerification();
