const fs = require('fs');
const path = require('path');

const files = [
  'src/app/cart/cart.css',
  'src/app/wishlist/wishlist.css',
  'src/app/product/product-detail.css',
  'src/app/search/search.css'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace salmon-pink
    content = content.replace(/var\(--salmon-pink\)/g, 'var(--brand-blue)');
    
    // Replace hsla with rgba brand blue
    // Regex matches hsla(216, 98%, 52%, 0.xx) and handles spaces gracefully
    content = content.replace(/hsla\(\s*216\s*,\s*98%\s*,\s*52%\s*,\s*(0\.\d+)\s*\)/g, 'rgba(24, 95, 165, $1)');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
