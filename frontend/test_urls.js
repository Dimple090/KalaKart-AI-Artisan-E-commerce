async function testUrl(url) {
    try {
        console.log(`URL: ${url}`);
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        console.log(`Content-Type: ${res.headers.get('content-type')}`);
        console.log(`Redirected: ${res.redirected}`);
        console.log(`Final URL: ${res.url}`);
        console.log('---');
    } catch (e) {
        console.error(`Error for ${url}: ${e.message}`);
    }
}

// Let's try dicebear - a reliable generic avatar generator as a fallback
testUrl('https://api.dicebear.com/7.x/bottts/svg?seed=Felix');
testUrl('https://api.dicebear.com/7.x/adventurer/svg?seed=Felix');
