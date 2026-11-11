const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createThumbnail } = require('../utils/thumbnail');
test('production converts PNG photos with Sharp without a macOS fallback', async () => {
  const sharp = require('sharp');
  const input = await sharp({ create: { width: 1200, height: 800, channels: 3, background: '#336699' } }).png().toBuffer();
  const thumbnail = await createThumbnail('data:image/png;base64,' + input.toString('base64'));
  assert.ok(thumbnail.startsWith('data:image/jpeg;base64,'));
  const metadata = await sharp(Buffer.from(thumbnail.split(',')[1], 'base64')).metadata();
  assert.equal(metadata.format, 'jpeg');
  assert.equal(metadata.width, 600);
  assert.equal(metadata.height, 400);
});
test('local photos are converted into JPEG thumbnails', { skip: process.platform !== 'darwin' }, async () => {
  const bmp = Buffer.alloc(58);
  bmp.write('BM'); bmp.writeUInt32LE(58, 2); bmp.writeUInt32LE(54, 10); bmp.writeUInt32LE(40, 14);
  bmp.writeInt32LE(1, 18); bmp.writeInt32LE(1, 22); bmp.writeUInt16LE(1, 26); bmp.writeUInt16LE(24, 28);
  bmp[56] = 255;
  const thumbnail = await createThumbnail('data:image/bmp;base64,' + bmp.toString('base64'));
  assert.ok(thumbnail.startsWith('data:image/jpeg;base64,'));
  assert.equal(Buffer.from(thumbnail.split(',')[1], 'base64').readUInt16BE(0), 0xffd8);
});
test('remote images are not fetched by the server', async () => {
  assert.equal(await createThumbnail('https://external.example/photo.jpg'), null);
  assert.equal(await createThumbnail(undefined), null);
});
