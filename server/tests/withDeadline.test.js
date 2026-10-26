const { test } = require('node:test');
const assert = require('node:assert/strict');
const { withDeadline } = require('../utils/withDeadline');
test('stalled read rejects while allowing a later completion to settle safely', async () => {
  let finish;
  const operation = new Promise(resolve => { finish = resolve; });
  await assert.rejects(withDeadline(operation, 10), { name: 'MongoOperationTimeoutError' });
  finish('late result');
});
test('successful reads and original errors are preserved', async () => {
  assert.equal(await withDeadline(Promise.resolve('vehicles'), 100), 'vehicles');
  const error = new Error('network failure');
  await assert.rejects(withDeadline(Promise.reject(error), 100), failure => failure === error);
});
