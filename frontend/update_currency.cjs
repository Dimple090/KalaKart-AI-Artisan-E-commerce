const fs = require('fs');
const path = require('path');

const fileReplacements = [
    {
        file: 'pages/Wishlist.jsx',
        replacements: [
            ['>${product.price}<', '>₹{product.price}<'],
            ['>${item.price}<', '>₹{item.price}<']
        ]
    },
    {
        file: 'pages/ProductDetails.jsx',
        replacements: [
            ['>${product.price}<', '>₹{product.price}<'],
            ['over $50', 'over ₹1000'],
            ['>${rec.price}<', '>₹{rec.price}<']
        ]
    },
    {
        file: 'pages/Orders.jsx',
        replacements: [
            ['>${order.totalPrice.toFixed(2)}<', '>₹{order.totalPrice.toFixed(2)}<'],
            ['>${(item.price * item.qty).toFixed(2)}', '>₹{(item.price * item.qty).toFixed(2)}']
        ]
    },
    {
        file: 'pages/Cart.jsx',
        replacements: [
            ['>${item.price}<', '>₹{item.price}<'],
            ['>${(item.price * item.quantity).toFixed(2)}<', '>₹{(item.price * item.quantity).toFixed(2)}<'],
            ['>$5.00<', '>₹100<'],
            ['>$10.00<', '>₹250<'],
            ['>${calculateSubtotal().toFixed(2)}<', '>₹{calculateSubtotal().toFixed(2)}<'],
            ['>${calculateTotal().toFixed(2)}<', '>₹{calculateTotal().toFixed(2)}<']
        ]
    },
    {
        file: 'pages/Dashboard.jsx',
        replacements: [
            ['>$1,234<', '>₹45,000<'],
            ['>$456<', '>₹15,000<'],
            ['>${order.totalPrice.toFixed(2)}<', '>₹{order.totalPrice.toFixed(2)}<'],
            ['>${product.price.toFixed(2)}<', '>₹{product.price.toFixed(2)}<'],
            ['>${stat.value}<', '>₹{stat.value}<'] // Might be used in dashboard cards
        ]
    },
    {
        file: 'pages/Home.jsx',
        replacements: [
            ['>${product.price}<', '>₹{product.price}<'],
            ['>${item.price}<', '>₹{item.price}<']
        ]
    },
    {
        file: 'pages/GiftFinder.jsx',
        replacements: [
            ['Under $50', 'Under ₹2000'],
            ['$50 - $100', '₹2000 - ₹5000'],
            ['Over $100', 'Over ₹5000'],
            ['>${product.price}<', '>₹{product.price}<']
        ]
    },
    {
        file: 'components/ProductCard.jsx',
        replacements: [
            ['>${product.price}<', '>₹{product.price}<'],
            ['>${product.price.toFixed(2)}<', '>₹{product.price.toFixed(2)}<'],
            ['>${price}<', '>₹{price}<']
        ]
    },
    {
        file: 'components/PaymentModal.jsx',
        replacements: [
            ['Total: ${Math.round(totalAmount)}', 'Total: ₹{Math.round(totalAmount)}'],
            ['>${amount}<', '>₹{amount}<'],
            ['Total: ${amount}', 'Total: ₹{amount}']
        ]
    }
];

const srcPath = path.join(__dirname, 'src');

fileReplacements.forEach(({ file, replacements }) => {
    const fullPath = path.join(srcPath, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let originalContent = content;
        
        replacements.forEach(([search, replace]) => {
            // using split join to replace all occurrences
            content = content.split(search).join(replace);
        });

        if (content !== originalContent) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`Updated currency in ${file}`);
        } else {
            console.log(`No changes needed in ${file} (search strings not found)`);
        }
    } else {
        console.log(`File not found: ${file}`);
    }
});
