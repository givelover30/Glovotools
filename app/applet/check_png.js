import fs from 'fs';

const filePath = './public/assets/aistudio/Blue_Gradient_Gear_Network_Icon_044c3032.png';
const buffer = fs.readFileSync(filePath);
console.log('File size:', buffer.length);
// Read PNG width/height from IHDR chunk (bytes 16-24)
if (buffer.length > 24) {
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  console.log('PNG Dimensions:', width, 'x', height);
}
