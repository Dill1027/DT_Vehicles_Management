const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCachedImageLoader } = require('../utils/cachedImageLoader');
const tick = () => new Promise(resolve => setImmediate(resolve));
test('concurrent cards use at most two reads and duplicate requests share a read', async () => {
  let active = 0, maximum = 0, calls = 0;
  const releases = [];
  const get = createCachedImageLoader(async () => {
    calls++; active++; maximum = Math.max(maximum, active);
    await new Promise(resolve => releases.push(resolve));
    active--; return { body: Buffer.from('photo') };
  });
  const first = get('a');
  assert.equal(get('a'), first);
  const all = Promise.all([first, get('b'), get('c'), get('d'), get('e')]);
  for (let i = 0; i < 5; i++) { await tick(); releases.splice(0).forEach(resolve => resolve()); }
  await all;
  assert.equal(maximum, 2); assert.equal(calls, 5);
  await get('a'); assert.equal(calls, 5);
});
test('version changes, expiry and memory eviction trigger fresh reads', async () => {
  let time = 0, calls = 0;
  const get = createCachedImageLoader(async () => { calls++; return { body: Buffer.alloc(2) }; }, { maxBytes: 3, ttlMS: 10, now: () => time });
  await get('a:v1'); await get('a:v1'); assert.equal(calls, 1);
  await get('a:v2'); await get('a:v1'); assert.equal(calls, 3);
  time = 11; await get('a:v1'); assert.equal(calls, 4);
});
test('failed image reads do not poison future attempts', async () => {
  let calls = 0;
  const get = createCachedImageLoader(async () => { if (++calls === 1) throw new Error('network'); return { body: Buffer.from('ok') }; });
  await assert.rejects(get('a'), /network/);
  await tick();
  assert.equal((await get('a')).body.toString(), 'ok');
});
