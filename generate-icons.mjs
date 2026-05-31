import sharp from 'sharp';
import { readFileSync } from 'fs';

const svgBuffer = readFileSync('public/icon-512.svg');

const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'maskable-icon-192.png' },
  { size: 512, name: 'maskable-icon-512.png' },
];

for (const { size, name } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`public/${name}`);
  console.log(`Created public/${name} (${size}x${size})`);
}

console.log('All icons generated!');
