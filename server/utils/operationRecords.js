function invalid(message) { const error = new Error(message); error.status = 400; throw error; }
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });
function validDate(value, optional = false) {
  if (optional && (value === '' || value == null)) return '';
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) invalid('Enter a valid date.');
  return value;
}
function number(value, label, { optional = false, positive = false, places = 2 } = {}) {
  if (optional && (value === '' || value == null)) return null;
  if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '' || !/^\d+(\.\d+)?$/.test(String(value)) || !Number.isFinite(Number(value)) || Number(value) > 100000000 || Number(value) < (positive ? 0.001 : 0)) invalid(`Enter a valid ${label}.`);
  return Math.round(Number(value) * 10 ** places) / 10 ** places;
}
function text(value, label, limit, required = false) {
  if (value == null && !required) return '';
  if (typeof value !== 'string' || value.trim().length > limit || (required && !value.trim())) invalid(`Enter a valid ${label} (up to ${limit} characters).`);
  return value.trim();
}
function receipt(value) {
  if (!value) return {};
  const name = text(value.name, 'receipt name', 150, true);
  const match = /^data:(application\/pdf|image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$/.exec(value.data || '');
  if (!match) invalid('Use a PDF, JPEG, PNG or WebP receipt.');
  const bytes = Buffer.from(match[2], 'base64');
  if (!bytes.length || bytes.length > 5 * 1024 * 1024) invalid('Receipt must be no larger than 5MB.');
  const mime = match[1];
  const valid = mime === 'application/pdf' ? bytes.subarray(0, 5).toString() === '%PDF-' : mime === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 : mime === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  if (!valid) invalid('The receipt contents do not match its file type.');
  return { receiptName: name, receiptMime: mime, receiptData: bytes };
}
function validateRecord(kind, body) {
  const date = validDate(body.date);
  if (date > today()) invalid('The record date cannot be in the future.');
  const result = { date, odometer: number(body.odometer, 'odometer reading', { places: 1 }), cost: number(body.cost, 'cost'), notes: text(body.notes, 'notes', 2000), ...receipt(body.receipt) };
  if (body.removeReceipt === true) Object.assign(result, { receiptName: null, receiptMime: null, receiptData: null });
  if (kind === 'service') {
    if (!['Service', 'Repair', 'Tyres', 'Battery', 'Other'].includes(body.category)) invalid('Choose a service category.');
    Object.assign(result, { category: body.category, description: text(body.description, 'description', 1000, true), provider: text(body.provider, 'garage/provider', 150), nextServiceDate: validDate(body.nextServiceDate, true), nextServiceMileage: number(body.nextServiceMileage, 'next service mileage', { optional: true, places: 1 }) });
    if (result.nextServiceDate && result.nextServiceDate < date) invalid('Next service date cannot be before this service.');
    if (result.nextServiceMileage != null && result.nextServiceMileage < result.odometer) invalid('Next service mileage cannot be below the recorded odometer.');
  } else {
    if (typeof body.fullTank !== 'boolean') invalid('Specify whether the tank was filled completely.');
    Object.assign(result, { liters: number(body.liters, 'fuel quantity', { positive: true, places: 3 }), station: text(body.station, 'fuel station', 150), fullTank: body.fullTank });
  }
  return result;
}
// A fill-to-fill interval includes every partial fill after the preceding full tank.
function fuelMetrics(records) {
  const efficiency = {};
  let previousFull = null, intervalLiters = 0, measuredKm = 0, measuredLiters = 0;
  for (const record of records) {
    if (previousFull) intervalLiters += record.liters;
    if (!record.fullTank) continue;
    if (previousFull && record.odometer > previousFull.odometer && intervalLiters > 0) {
      const distance = record.odometer - previousFull.odometer;
      efficiency[String(record._id)] = { kmPerLiter: distance / intervalLiters, distance, liters: intervalLiters };
      measuredKm += distance; measuredLiters += intervalLiters;
    }
    previousFull = record; intervalLiters = 0;
  }
  return { efficiency, averageKmPerLiter: measuredLiters > 0 ? measuredKm / measuredLiters : null, measuredKm, measuredLiters };
}
function recordFingerprint(values) {
  const hash = require('node:crypto').createHash('sha256');
  for (const key of Object.keys(values).sort()) {
    hash.update(key + '\0');
    hash.update(Buffer.isBuffer(values[key]) ? values[key] : JSON.stringify(values[key]));
    hash.update('\0');
  }
  return hash.digest('hex');
}
module.exports = { recordFingerprint, validateRecord, validDate, fuelMetrics, today, invalid };
