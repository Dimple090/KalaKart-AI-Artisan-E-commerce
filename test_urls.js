const http = require('http');
const https = require('https');
const url = require('url');

const testUrl = (href) => {
    return new Promise((resolve) => {
        const u = url.parse(href);
        const protocol = u.protocol === 'https:' ? https : http;
        
        const req = protocol.request({
            method: 'HEAD',
            hostname: u.hostname,
            path: u.path,
        }, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 400) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
        
        req.on('error', () => resolve(false));
        req.end();
    });
};

async function run() {
    const res = await testUrl("https://images.unsplash.com/photo-1610030469983-98e5509c530c?q=80&w=800&auto=format&fit=crop");
    console.log("Unsplash Image 1: " + res);
    
    const res2 = await testUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4");
    console.log("Video: " + res2);
}

run();
