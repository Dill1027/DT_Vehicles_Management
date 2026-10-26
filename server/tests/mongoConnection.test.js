const { test } = require('node:test');
const assert = require('node:assert/strict');
const { configureMongoDns, createMongoConnector } = require('../utils/mongoConnection');

test('DNS override is opt-in and accepts multiple trimmed resolvers', () => {
  const calls = [];
  const resolver = { setServers: servers => calls.push(servers) };
  configureMongoDns(undefined, resolver);
  configureMongoDns('  ', resolver);
  assert.equal(calls.length, 0);
  configureMongoDns('1.1.1.1, 8.8.8.8,', resolver);
  assert.deepEqual(calls, [['1.1.1.1', '8.8.8.8']]);
});

test('simultaneous requests share one connection attempt', async () => {
  let resolveConnection;
  let attempts = 0;
  const mongoose = { connection: { readyState: 0 }, connect: () => {
    attempts++;
    return new Promise(resolve => { resolveConnection = resolve; });
  } };
  const connect = createMongoConnector(mongoose, 'mongodb://example/test');
  const first = connect();
  const second = connect();
  assert.equal(first, second);
  await Promise.resolve();
  assert.equal(attempts, 1);
  resolveConnection(mongoose);
  assert.equal(await first, mongoose);
});

test('failed attempts can be retried and established connections are reused', async () => {
  let attempts = 0;
  const mongoose = { connection: { readyState: 0 }, connect: async () => {
    if (++attempts === 1) throw new Error('querySrv ECONNREFUSED');
    mongoose.connection.readyState = 1;
    return mongoose;
  } };
  const connect = createMongoConnector(mongoose, 'mongodb://example/test');
  await assert.rejects(connect(), /ECONNREFUSED/);
  assert.equal(await connect(), mongoose);
  assert.equal(await connect(), mongoose);
  assert.equal(attempts, 2);
});

test('stalled DNS discovery fails within the deadline without launching more attempts', async () => {
  let finish;
  let attempts = 0;
  const mongoose = { connection: { readyState: 0 }, connect: () => {
    attempts++;
    return new Promise(resolve => { finish = resolve; });
  } };
  const connect = createMongoConnector(mongoose, 'mongodb+srv://example/test', 15);
  await assert.rejects(connect(), /connection timed out/);
  await assert.rejects(connect(), /connection timed out/);
  assert.equal(attempts, 1);
  mongoose.connection.readyState = 1;
  finish(mongoose);
  await Promise.resolve();
  assert.equal(await connect(), mongoose);
});
