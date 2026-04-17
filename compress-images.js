/**
 * Image Compression Script for Texloom Website
 * Converts PNG/JPG images to WebP and resizes them to appropriate display sizes.
 * Run: node compress-images.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, 'images');

// Images to compress with their target display widths (2x for retina)
const targets = [
  // Critical above-fold images
  { file: 'about1.png',                  width: 730,  quality: 82 }, // displayed at 365px → 2x = 730
  { file: 'abouut2.png',                 width: 530,  quality: 82 }, // displayed at 263px → 2x = 530
  { file: 'mission.png',                 width: 1200, quality: 80 },
  { file: 'product1.png',                width: 600,  quality: 80 },
  { file: 'product2.png',                width: 600,  quality: 80 },
  { file: 'product3.png',                width: 600,  quality: 80 },
  { file: 'product4.png',                width: 600,  quality: 80 },
  { file: 'machinery1.png',              width: 800,  quality: 80 },
  { file: 'machinery2.png',              width: 800,  quality: 80 },
  { file: 'machinery3.png',              width: 800,  quality: 80 },
  { file: 'feature-image-tamil.png',     width: 800,  quality: 82 },
  { file: 'achyuth-sivakumar.png',       width: 600,  quality: 82 },
  { file: 'bharathi-sivakumar-white.png',width: 600,  quality: 82 },
];

// JPEG images (compress in-place, no format conversion needed but save as webp too)
const jpegTargets = [
  { file: 'hero-bg-image.jpg',           width: 1880, quality: 80 },
  { file: 'faq-image-stone.jpg',         width: 900,  quality: 80 },
  { file: 'project-image-6.jpg',         width: 900,  quality: 80 },
  { file: 'testimonial-bg-image.png',    width: 1880, quality: 80 },
];

const allTargets = [...targets, ...jpegTargets];

async function compressImage({ file, width, quality }) {
  const inputPath = path.join(imagesDir, file);
  if (!fs.existsSync(inputPath)) {
    console.log(`⚠  Skipped (not found): ${file}`);
    return;
  }

  const ext = path.extname(file);
  const baseName = path.basename(file, ext);
  const webpOutput = path.join(imagesDir, `${baseName}.webp`);

  const originalSize = Math.round(fs.statSync(inputPath).size / 1024);

  try {
    // Save as WebP
    await sharp(inputPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toFile(webpOutput);

    const newSize = Math.round(fs.statSync(webpOutput).size / 1024);
    const saving = Math.round((1 - newSize / originalSize) * 100);
    console.log(`✅ ${file.padEnd(35)} ${originalSize} KB → ${newSize} KB WebP  (${saving}% saved)`);
  } catch (err) {
    console.error(`❌ Error processing ${file}:`, err.message);
  }
}

(async () => {
  console.log('\n🚀 Texloom Image Compression\n' + '─'.repeat(65));

  try {
    require('sharp');
  } catch {
    console.error('❌ sharp is not installed. Run: npm install sharp');
    process.exit(1);
  }

  for (const target of allTargets) {
    await compressImage(target);
  }

  console.log('\n✨ Done! WebP files created in /images/');
  console.log('📌 Next: update <img> tags in HTML to use <picture> with WebP sources.');
})();
