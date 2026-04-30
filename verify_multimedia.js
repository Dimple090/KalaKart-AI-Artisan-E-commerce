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

async function verifyMultimedia() {
    console.log('🚀 Starting Multimedia Verification...');
    
    // 1. Login
    const { token } = await makeRequest(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email: 'artisan@kalakart.com', password: 'password123' })
    });
    console.log('✅ Login successful');

    // 2. Create Product with Video and 3D
    const productData = {
        name: '3D Test Vase',
        description: 'A beautiful test vase with 3D model and video.',
        price: 1500,
        category: 'Pottery',
        stock: 5,
        imageUrl: 'https://picsum.photos/seed/test/600/600',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb'
    };

    console.log('📦 Creating product with multimedia...');
    const createdProduct = await makeRequest(`${BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(productData)
    });
    
    if (createdProduct.videoUrl === productData.videoUrl && createdProduct.modelUrl === productData.modelUrl) {
        console.log('✅ Multimedia fields saved correctly in createProduct');
    } else {
        console.error('❌ Multimedia fields NOT saved correctly in createProduct', {
            expectedVideo: productData.videoUrl,
            actualVideo: createdProduct.videoUrl,
            expectedModel: productData.modelUrl,
            actualModel: createdProduct.modelUrl
        });
        process.exit(1);
    }

    // 3. Update Multimedia
    const updateData = {
        videoUrl: 'https://www.youtube.com/embed/updated',
        modelUrl: 'https://path.to/updated.glb'
    };

    console.log('🔄 Updating multimedia...');
    const updatedProduct = await makeRequest(`${BASE_URL}/products/${createdProduct._id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updateData)
    });

    if (updatedProduct.videoUrl === updateData.videoUrl && updatedProduct.modelUrl === updateData.modelUrl) {
        console.log('✅ Multimedia fields updated correctly in updateProduct');
    } else {
        console.error('❌ Multimedia fields NOT updated correctly in updateProduct');
        process.exit(1);
    }

    console.log('🎉 Multimedia Verification PASSED!');
}

verifyMultimedia().catch(err => {
    console.error('💥 Verification failed:', err);
    process.exit(1);
});
