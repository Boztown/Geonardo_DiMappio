// Copies index.html to dist/index.html and updates the script tag to point to index.js
const fs = require('fs');
const path = require('path');

const srcHtml = path.join(__dirname, '../index.html');
const distHtml = path.join(__dirname, '../dist/index.html');
const distJs = 'index.js';

let html = fs.readFileSync(srcHtml, 'utf8');

// Replace any <script> tag with src pointing to index.ts or index.js
html = html.replace(/<script[^>]*src=["'].*?["'][^>]*><\/script>/, `<script src="${distJs}"></script>`);

fs.mkdirSync(path.dirname(distHtml), { recursive: true });
fs.writeFileSync(distHtml, html);

console.log(`Copied and updated index.html to dist/index.html`);