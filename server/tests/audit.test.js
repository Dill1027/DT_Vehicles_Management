const { test } = require('node:test');
const assert = require('node:assert/strict');
const { changedFields, safeSnapshot } = require('../utils/audit');
test('activity entries contain exact field changes without credentials or binary data', () => {
  const before = { name: 'Editor', email: 'editor@example.com', role: 'editor', passwordHash: 'NEVER_LOG_HASH', tokenVersion: 3 };
  const after = { ...before, role: 'viewer', password: 'NEVER_LOG_PASSWORD' };
  assert.deepEqual(changedFields('user', before, after), [{ field: 'role', before: 'editor', after: 'viewer' }]);
  assert.ok(!JSON.stringify(safeSnapshot('user', after)).includes('NEVER_LOG'));
  const record = safeSnapshot('service', { cost: 100, receiptName: 'bill.pdf', receiptData: 'NEVER_LOG_BLOB' });
  assert.equal(record.receiptName, 'bill.pdf'); assert.ok(!JSON.stringify(record).includes('NEVER_LOG'));
});
test('archive history records timestamps consistently and preserves false and zero', () => {
  const changes = changedFields('vehicle', { archivedAt: null }, { archivedAt: new Date('2026-01-01T00:00:00Z') });
  assert.deepEqual(changes, [{ field: 'archivedAt', before: null, after: '2026-01-01T00:00:00.000Z' }]);
  assert.equal(safeSnapshot('fuel', { cost: 0, fullTank: false }).cost, 0);
  assert.equal(safeSnapshot('fuel', { cost: 0, fullTank: false }).fullTank, false);
});
