const BASE_URL = 'http://localhost:5000/api';

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

async function verifyCommissions() {
    console.log('🚀 Starting Commission Verification...');
    
    // 1. Login as Buyer (using artisan account for test)
    const { token: buyerToken } = await makeRequest(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: 'artisan@kalakart.com', password: 'password123' })
    });
    console.log('✅ Buyer logged in');

    // 2. Login as Artisan
    const artisanData = await makeRequest(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: 'artisan@kalakart.com', password: 'password123' })
    });
    const artisanToken = artisanData.token;
    console.log('✅ Artisan logged in');

    // 3. Buyer creates Commission Request
    console.log('📦 Submitting commission request...');
    const commissionRequest = {
        artisanId: artisanData._id,
        requestDetails: "I want a custom wooden Ganesha idol, about 10 inches tall, with intricate carvings on the throne. My budget is ₹8000."
    };
    const createdComm = await makeRequest(`${BASE_URL}/commissions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${buyerToken}` },
        body: JSON.stringify(commissionRequest)
    });
    console.log('✅ Commission created with AI Estimate:', createdComm.aiEstimate);

    if (!createdComm.aiEstimate.suggestedPriceRange.includes('₹')) {
        console.error('❌ AI Estimate is not localized to ₹');
        process.exit(1);
    }

    // 4. Artisan views Commissions
    console.log('👀 Artisan fetching commissions...');
    const artisanComms = await makeRequest(`${BASE_URL}/commissions/artisan`, {
        headers: { 'Authorization': `Bearer ${artisanToken}` }
    });
    const myComm = artisanComms.find(c => c._id === createdComm._id);
    if (myComm) console.log('✅ Artisan found the request');
    else { console.error('❌ Artisan could not find the request'); process.exit(1); }

    // 5. Artisan Accepts Commission with Final Quote
    console.log('🤝 Artisan accepting with quote...');
    const acceptedComm = await makeRequest(`${BASE_URL}/commissions/${createdComm._id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${artisanToken}` },
        body: JSON.stringify({ status: 'Accepted', finalPrice: 8500 })
    });
    
    if (acceptedComm.status === 'Accepted' && acceptedComm.finalPrice === 8500) {
        console.log('✅ Commission status and price updated correctly');
    } else {
        console.error('❌ Status/Price update failed', acceptedComm);
        process.exit(1);
    }

    console.log('🎉 Commission Verification PASSED!');
}

verifyCommissions().catch(err => {
    console.error('💥 Verification failed:', err);
    process.exit(1);
});
