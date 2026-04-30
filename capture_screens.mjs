import puppeteer from 'puppeteer';

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set a good viewport for desktop screenshots
    await page.setViewport({ width: 1280, height: 800 });
    
    const baseUrl = 'http://localhost:5174'; // I will check what port frontend is, let's say 5174 or 5173

    try {
        console.log('Navigating to Home...');
        await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: './screenshots/home.png', fullPage: true });
        console.log('Saved home.png');

        console.log('Navigating to Cart...');
        await page.goto(`${baseUrl}/cart`, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: './screenshots/cart.png', fullPage: true });
        console.log('Saved cart.png');

        console.log('Navigating to Gift Finder (AI Feature)...');
        await page.goto(`${baseUrl}/gift-finder`, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: './screenshots/ai-feature.png', fullPage: true });
        console.log('Saved ai-feature.png');
        
        // Login to access dashboard
        console.log('Logging in to Dashboard...');
        await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2' });
        await page.type('input[type="email"]', 'artisan@kalakart.com');
        await page.type('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
        
        console.log('Navigating to Dashboard...');
        await page.goto(`${baseUrl}/dashboard`, { waitUntil: 'networkidle2' });
        await page.screenshot({ path: './screenshots/dashboard.png', fullPage: true });
        console.log('Saved dashboard.png');
        
    } catch (e) {
        console.error('Error during screenshots:', e);
    } finally {
        await browser.close();
        console.log('Done.');
    }
})();
