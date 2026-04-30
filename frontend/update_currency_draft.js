const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(dirPath);
    });
}

let modifiedFiles = 0;

walk(srcDir, (filePath) => {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        let oldContent = fs.readFileSync(filePath, 'utf-8');
        
        let newContent = oldContent;

        // Replace $ followed by { (JSX or template literal variables) e.g. <span>${product.price}</span>
        // Wait, in JSX: <span>${price}</span>  -> The text is $ then {price}.
        newContent = newContent.replace(/\$\{(?!.*return)/g, '₹{'); // replacing $ followed by {
        // Wait! In regular JS, `${...}` IS the template literal. 
        // If I change `${price}` to `₹{price}` in JS, it will break!!
        // Example:  `http://localhost:5000/api/users/${id}` -> `http://localhost:5000/api/users/₹{id}` (BROKEN!)
    }
});
