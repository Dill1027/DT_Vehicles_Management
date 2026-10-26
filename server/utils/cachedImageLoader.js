// Share in-flight reads, limit database pressure, and retain bounded binary assets.
function createCachedImageLoader(load, { concurrency = 2, maxBytes = 64 * 1024 * 1024, ttlMS = 300000, now = Date.now } = {}) {
  const cache = new Map();
  const pending = new Map();
  const queue = [];
  let active = 0;
  let bytes = 0;
  function remove(key) {
    const entry = cache.get(key);
    if (entry) { bytes -= entry.bytes; cache.delete(key); }
  }
  function drain() {
    while (active < concurrency && queue.length) {
      const { key, resolve, reject } = queue.shift();
      active++;
      Promise.resolve().then(() => load(key)).then(asset => {
        if (asset) {
          const size = asset.body?.length || 256;
          if (size <= maxBytes) {
            remove(key);
            while (bytes + size > maxBytes && cache.size) remove(cache.keys().next().value);
            cache.set(key, { asset, bytes: size, expires: now() + ttlMS });
            bytes += size;
          }
        }
        pending.delete(key);
        active--;
        drain();
        resolve(asset);
      }, error => {
        pending.delete(key);
        active--;
        drain();
        reject(error);
      });
    }
  }
  return function getImage(key) {
    const entry = cache.get(key);
    if (entry && entry.expires > now()) {
      cache.delete(key); cache.set(key, entry);
      return Promise.resolve(entry.asset);
    }
    remove(key);
    if (pending.has(key)) return pending.get(key);
    const promise = new Promise((resolve, reject) => queue.push({ key, resolve, reject }));
    pending.set(key, promise);
    drain();
    return promise;
  };
}
module.exports = { createCachedImageLoader };
