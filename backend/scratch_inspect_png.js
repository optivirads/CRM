const fs = require('fs');
const zlib = require('zlib');

function readPNG(filePath) {
  const buf = fs.readFileSync(filePath);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25];
  
  // Collect all IDAT chunks
  let pos = 8;
  const idatChunks = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    if (type === 'IDAT') {
      idatChunks.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }
  const decompressed = zlib.inflateSync(Buffer.concat(idatChunks));
  return { width, height, data: decompressed, colorType };
}

function analyze(name, filePath) {
  const png = readPNG(filePath);
  console.log(`=== ${name} (${png.width}x${png.height}) ===`);
  // Each scanline: 1 filter byte + width * (colorType == 6 ? 4 : (colorType == 2 ? 3 : 1))
  const bpp = png.colorType === 6 ? 4 : (png.colorType === 2 ? 3 : 1);
  const stride = 1 + png.width * bpp;
  
  function getPixel(x, y) {
    const rowOffset = y * stride + 1;
    const pxOffset = rowOffset + x * bpp;
    return {
      r: png.data[pxOffset],
      g: png.data[pxOffset + 1],
      b: png.data[pxOffset + 2]
    };
  }

  // Find sidebar right border across middle of screen (y = 250)
  // Sidebar is dark (#070E1A or #0A1628), then border (#14233D), then main background
  console.log('Row y = 250 pixel colors at various X:');
  const sampleXs = [100, 120, 130, 140, 150, 160, 170, 180, 190, 200, 250, 300, 400, 600, 800, 900, 950, 1000];
  sampleXs.forEach(x => {
    const p = getPixel(x, 250);
    console.log(`  x=${x}: rgb(${p.r}, ${p.g}, ${p.b})`);
  });
}

analyze('Image 1 (Current)', 'C:/Users/abhin/.gemini/antigravity-ide/brain/1fe73489-1e13-4295-9d2f-f0664132e0ff/.user_uploaded/media_1789744030964.png');
analyze('Image 2 (Target)', 'C:/Users/abhin/.gemini/antigravity-ide/brain/1fe73489-1e13-4295-9d2f-f0664132e0ff/.user_uploaded/media_1789744090203.png');
