const fs = require('fs');

const srcPath = './public/assets/aistudio/Blue_Gradient_Gear_Network_Icon_044c3032.png';
const targets = [
  './public/favicon.ico',
  './public/favicon-16x16.png',
  './public/favicon-32x32.png',
  './public/apple-touch-icon.png',
  './public/icon-192.png'
];

const imgBuffer = fs.readFileSync(srcPath);
for (const target of targets) {
  fs.writeFileSync(target, imgBuffer);
  console.log(`Copied to ${target}`);
}

const base64Img = imgBuffer.toString('base64');
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${base64Img}" width="512" height="512"/>
</svg>`;
fs.writeFileSync('./public/favicon.svg', svgContent);
console.log('Created ./public/favicon.svg');
