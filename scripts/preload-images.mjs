import { readFileSync, writeFileSync } from 'fs';
import { extname } from 'path';

const MIME = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.avif': 'image/avif',
  '.bmp':  'image/bmp',
  '.ico':  'image/x-icon',
  '.tiff': 'image/tiff',
  '.tif':  'image/tiff',
};

const html = readFileSync('index.html', 'utf8');

// Extract every img src referenced in the HTML body
const srcs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)]
  .map(m => m[1])
  .filter(src => {
    const ext = extname(src).toLowerCase();
    return ext in MIME;
  });

// Deduplicate while preserving order
const seen = new Set();
const images = srcs.filter(src => {
  if (seen.has(src)) return false;
  seen.add(src);
  return true;
});

const tags = images
  .map(src => {
    const type = MIME[extname(src).toLowerCase()];
    return `    <link rel="preload" as="image" type="${type}" href="${src}">`;
  })
  .join('\n');

const updated = html.replace(
  /<!-- preload:images -->[\s\S]*?<!-- \/preload:images -->/,
  `<!-- preload:images -->\n${tags}\n    <!-- /preload:images -->`
);

writeFileSync('index.html', updated);
console.log(`Injected ${images.length} image preloads:`, images);
