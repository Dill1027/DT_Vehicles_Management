const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateRecord, fuelMetrics } = require('../utils/operationRecords');
const service = { date: '2026-01-01', odometer: 1000, cost: 1234.56, notes: '', category: 'Service', description: 'Oil change', provider: 'Garage', nextServiceDate: '2026-04-01', nextServiceMileage: 6000 };
test('service validation allows zero values but rejects invalid costs, dates and schedules', () => {
  assert.equal(validateRecord('service', { ...service, cost: 0, odometer: 0 }).cost, 0);
  for (const changes of [{ cost: -1 }, { cost: null }, { odometer: '' }, { date: '2026-02-30' }, { nextServiceDate: '2025-01-01' }, { nextServiceMileage: 999 }, { description: '' }]) assert.throws(() => validateRecord('service', { ...service, ...changes }));
});
test('fuel validation rejects zero quantity, non-boolean full-tank flags and receipt type spoofing', () => {
  const fuel = { date: '2026-01-01', odometer: 1000, cost: 100, liters: 10, fullTank: true };
  assert.equal(validateRecord('fuel', fuel).liters, 10);
  for (const changes of [{ liters: 0 }, { liters: -1 }, { fullTank: 'true' }, { receipt: { name: 'fake.pdf', data: 'data:application/pdf;base64,' + Buffer.from('<script>bad</script>').toString('base64') } }]) assert.throws(() => validateRecord('fuel', { ...fuel, ...changes }));
});
test('full-tank efficiency includes partial fills and excludes initial fill quantity', () => {
  const result = fuelMetrics([
    { _id: 'first', odometer: 1000, liters: 40, fullTank: true },
    { _id: 'partial', odometer: 1100, liters: 10, fullTank: false },
    { _id: 'second', odometer: 1300, liters: 20, fullTank: true },
    { _id: 'third', odometer: 1500, liters: 10, fullTank: true }
  ]);
  assert.equal(result.efficiency.second.kmPerLiter, 10);
  assert.equal(result.efficiency.third.kmPerLiter, 20);
  assert.equal(result.averageKmPerLiter, 12.5);
  assert.equal(result.efficiency.first, undefined);
  assert.equal(fuelMetrics([{ odometer: 100, liters: 10, fullTank: false }]).averageKmPerLiter, null);
});
test('a real PDF receipt is retained without accepting untrusted metadata', () => {
  const record = validateRecord('service', { ...service, receipt: { name: 'bill.pdf', data: 'data:application/pdf;base64,' + Buffer.from('%PDF-1.4\n%%EOF').toString('base64') }, createdBy: 'spoofed', voidedAt: new Date() });
  assert.equal(record.receiptMime, 'application/pdf');
  assert.ok(Buffer.isBuffer(record.receiptData));
  assert.equal(record.createdBy, undefined); assert.equal(record.voidedAt, undefined);
});

test('request fingerprints normalize values and detect changed receipt content', () => {
  const { recordFingerprint } = require('../utils/operationRecords');
  const first = validateRecord('service', { ...service, cost: '1234.56' });
  const second = validateRecord('service', { ...service, cost: 1234.56 });
  assert.equal(recordFingerprint(first), recordFingerprint(second));
  assert.notEqual(recordFingerprint(first), recordFingerprint({ ...second, cost: 100 }));
  assert.notEqual(recordFingerprint({ receiptData: Buffer.from('one') }), recordFingerprint({ receiptData: Buffer.from('two') }));
});
