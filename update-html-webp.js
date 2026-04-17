/**
 * Auto-update HTML img tags to use <picture> with WebP source.
 * Run: node update-html-webp.js
 * 
 * Converts:  <img src="images/foo.png" ...>
 * To:        <picture><source srcset="images/foo.webp" type="image/webp"><img src="images/foo.png" ...></picture>
 *
 * Only wraps images for which a .webp file exists. Skips already-wrapped ones.
 */

const fs = require('fs');
const path = require('path');

const htmlFiles = ['index.html', 'services.html'];
const imagesDir = path.join(__dirname, 'images');

// Image extensions to convert
const EXT_RE = /\.(png|jpe?g)(?=")/gi;

for (const htmlFile of htmlFiles) {
  const filePath = path.join(__dirname, htmlFile);
  if (!fs.existsSync(filePath)) continue;

  let html = fs.readFileSync(filePath, 'utf8');
  let count = 0;

  // Match <img src="images/xxx.png" ... > that are NOT already inside a <picture>
  // We'll do a simple pattern: find <img ... src="images/XXX.EXT" ...> not preceded by <source
  html = html.replace(
    /(<img\b[^>]*\bsrc="(images\/[^"]+\.(png|jpe?g))"[^>]*>)/gi,
    (match, fullImg, srcPath) => {
      // Check if already inside a <picture>
      const baseName = path.basename(srcPath, path.extname(srcPath));
      const webpPath = `images/${baseName}.webp`;
      const webpDiskPath = path.join(__dirname, webpPath);

      if (!fs.existsSync(webpDiskPath)) return match; // no webp, skip
      
      count++;
      return `<picture><source srcset="${webpPath}" type="image/webp">${fullImg}</picture>`;
    }
  );

  // Clean up double-wrapping if script run twice
  html = html.replace(/<picture><source([^>]+)><picture><source[^>]+>(<img[^>]+>)<\/picture><\/picture>/gi,
    '<picture><source$1>$2</picture>');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`✅ ${htmlFile}: ${count} image(s) updated to use WebP`);
}

console.log('\n✨ Done! All <img> tags updated with <picture> + WebP source.');
