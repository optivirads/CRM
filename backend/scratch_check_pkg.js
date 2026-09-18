const fs = require('fs');

// Simple PNG pixel reader (using lodepng or parsing raw IDAT, or we can check header text)
// Since pngjs or similar might not be installed, let's check installed packages:
try {
  const pkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  console.log('Dependencies:', Object.keys(pkg.dependencies || {}));
} catch (e) {
  console.log('Error:', e.message);
}
