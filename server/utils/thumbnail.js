const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const run = promisify(execFile);

// Use Sharp when installed; macOS also provides native HEIC decoding through sips.
async function createThumbnail(source) {
  const data = /^data:(image\/[\w.+-]+);base64,([A-Za-z0-9+/=\r\n]+)$/.exec(source || '');
  let input;
  if (data) input = Buffer.from(data[2], 'base64');
  else if (typeof source === 'string' && source.startsWith('/uploads/')) {
    const root = path.resolve(__dirname, '../uploads');
    const file = path.resolve(root, source.slice('/uploads/'.length));
    if (!file.startsWith(root + path.sep)) return null;
    input = await fs.readFile(file);
  } else return null;
  if (input.length > 15 * 1024 * 1024) throw new Error('Image exceeds 15MB');
  try {
    const sharp = require('sharp');
    const output = await sharp(input, { limitInputPixels: 50000000 }).rotate().resize(640, 400, { fit: 'inside', withoutEnlargement: true }).flatten({ background: '#ffffff' }).jpeg({ quality: 75 }).toBuffer();
    return `data:image/jpeg;base64,${output.toString('base64')}`;
  } catch (error) {
    if (process.platform !== 'darwin') throw new Error('Thumbnail conversion requires Sharp on this server.');
  }
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'dt-thumbnail-'));
  try {
    const file = path.join(dir, 'original');
    const output = path.join(dir, 'thumbnail.jpg');
    await fs.writeFile(file, input);
    await run('/usr/bin/sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '75', '-Z', '640', file, '--out', output], { timeout: 20000 });
    return `data:image/jpeg;base64,${(await fs.readFile(output)).toString('base64')}`;
  } finally { await fs.rm(dir, { recursive: true, force: true }); }
}
module.exports = { createThumbnail };
