const https = require('https');

const categories = [
    'Category:Textiles_of_India',
    'Category:Pottery_of_India',
    'Category:Handicrafts_of_India',
    'Category:Jewellery_of_India',
    'Category:Wood_carving_of_India'
];

async function fetchWikiImages(category) {
    return new Promise((resolve, reject) => {
        const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=${category}&gcmtype=file&gcmlimit=20&prop=imageinfo&iiprop=url&format=json`;
        const options = {
            headers: { 'User-Agent': 'KalaKartSeeder/1.0 (test@example.com)' }
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed.query ? parsed.query.pages : {};
                    const urls = Object.values(pages).map(p => {
                        const imageinfo = p.imageinfo ? p.imageinfo[0] : null;
                        return imageinfo ? imageinfo.url : null;
                    }).filter(url => url && (url.endsWith('.jpg') || url.endsWith('.png')));
                    resolve(urls);
                } catch (e) {
                    resolve([]);
                }
            });
        }).on('error', (e) => resolve([]));
    });
}

async function run() {
    let allUrls = [];
    for (const cat of categories) {
        const urls = await fetchWikiImages(cat);
        allUrls = allUrls.concat(urls);
    }
    console.log(`Found ${allUrls.length} images.`);
    if (allUrls.length > 0) {
        console.log(allUrls.slice(0, 5));
    }
}

run();
