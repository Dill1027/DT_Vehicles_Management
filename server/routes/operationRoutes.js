const router = require('express').Router();
const { Types } = require('mongoose');
const Vehicle = require('../models/Vehicle');
const ServiceRecord = require('../models/ServiceRecord');
const FuelRecord = require('../models/FuelRecord');
const { allowRoles } = require('../middleware/auth');
const { auditedWrite } = require('../utils/audit');
const { validateRecord, recordFingerprint, fuelMetrics, today } = require('../utils/operationRecords');
const models = { service: ServiceRecord, fuel: FuelRecord };
const getModel = kind => Object.prototype.hasOwnProperty.call(models, kind) ? models[kind] : null;
const fail = (status, message) => Object.assign(new Error(message), { status });
const respondError = (res, error) => res.status(error.status || (error.code === 11000 ? 409 : 503)).json({ message: error.status ? error.message : error.code === 11000 ? 'A fuel entry already exists for this date and odometer.' : 'Unable to complete this request. Please try again.' });
router.use('/:vehicleId', async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.vehicleId)) throw fail(400, 'Invalid vehicle.');
    const vehicle = await Vehicle.findById(req.params.vehicleId).select('vehicleNumber archivedAt').setOptions({ includeArchived: req.user.role === 'admin' }).lean();
    if (!vehicle) throw fail(404, 'Vehicle not found.');
    req.operationVehicle = vehicle;
    next();
  } catch (error) { respondError(res, error); }
});
router.get('/:vehicleId', async (req, res) => {
  try {
    const kind = req.query.kind || 'service', Model = getModel(kind);
    if (!Model) throw fail(400, 'Choose service or fuel records.');
    const page = Number(req.query.page || 1), limit = 20;
    if (!Number.isSafeInteger(page) || page < 1 || page > 10000) throw fail(400, 'Choose a valid page.');
    const filter = { vehicle: req.operationVehicle._id, voidedAt: null };
    const month = today().slice(0, 7);
    const [records, total, services, fuelRows] = await Promise.all([
      Model.find(filter).sort({ date: -1, odometer: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Model.countDocuments(filter),
      ServiceRecord.aggregate([{ $match: filter }, { $group: { _id: null, totalCost: { $sum: '$cost' }, monthlyCost: { $sum: { $cond: [{ $eq: [{ $substrBytes: ['$date', 0, 7] }, month] }, '$cost', 0] } }, count: { $sum: 1 } } }]),
      FuelRecord.find(filter).select('date odometer liters cost fullTank').sort({ date: 1, odometer: 1, _id: 1 }).lean()
    ]);
    const metrics = fuelMetrics(fuelRows);
    const fuel = { totalCost: fuelRows.reduce((sum, row) => sum + row.cost, 0), monthlyCost: fuelRows.filter(row => row.date.startsWith(month)).reduce((sum, row) => sum + row.cost, 0), liters: fuelRows.reduce((sum, row) => sum + row.liters, 0), count: fuelRows.length, averageKmPerLiter: metrics.averageKmPerLiter };
    res.json({ data: records.map(record => ({ ...record, efficiency: kind === 'fuel' ? metrics.efficiency[String(record._id)] || null : undefined })), pagination: { page, pages: Math.max(1, Math.ceil(total / limit)), total }, summary: { service: services[0] || { totalCost: 0, monthlyCost: 0, count: 0 }, fuel, month } });
  } catch (error) { respondError(res, error); }
});
router.get('/:vehicleId/:kind/:recordId/receipt', async (req, res) => {
  try {
    const Model = getModel(req.params.kind);
    if (!Model || !Types.ObjectId.isValid(req.params.recordId)) throw fail(404, 'Receipt not found.');
    const record = await Model.findOne({ _id: req.params.recordId, vehicle: req.operationVehicle._id, voidedAt: null }).select('receiptName receiptMime +receiptData');
    if (!record?.receiptData) throw fail(404, 'Receipt not found.');
    res.set('Cache-Control', 'private, no-store');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.type(record.receiptMime);
    res.attachment(record.receiptName || 'receipt');
    res.send(record.receiptData);
  } catch (error) { respondError(res, error); }
});
async function mutateRecord(req, res) {
  try {
    const kind = req.params.kind, Model = getModel(kind);
    if (!Model) throw fail(400, 'Choose service or fuel records.');
    const removing = req.method === 'DELETE', editing = Boolean(req.params.recordId);
    if (editing && !Types.ObjectId.isValid(req.params.recordId)) throw fail(404, 'Record not found.');
    const values = removing ? null : validateRecord(kind, req.body);
    const requestId = !editing && typeof req.body.requestId === 'string' ? req.body.requestId : undefined;
    if (!editing && req.body.requestId !== undefined && (typeof req.body.requestId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(req.body.requestId))) throw fail(400, 'Invalid request identifier.');
    const fingerprint = requestId ? recordFingerprint(values) : undefined;
    const action = removing ? 'voided' : editing ? 'updated' : 'created';
    const record = await auditedWrite(req.user, `${kind}.${action}`, kind, async session => {
      // Serialize writes to this vehicle so concurrent odometer edits cannot race.
      const lock = await Vehicle.updateOne({ _id: req.operationVehicle._id, archivedAt: null }, { $inc: { operationsVersion: 1 } }, { session, timestamps: false });
      if (!lock.matchedCount) throw fail(409, 'Restore this vehicle before changing its records.');
      if (requestId) {
        const existing = await Model.findOne({ vehicle: req.operationVehicle._id, requestId }).select('+requestFingerprint').session(session);
        if (existing) {
          if (existing.voidedAt || String(existing.createdBy) !== String(req.user._id) || existing.requestFingerprint !== fingerprint) throw fail(409, 'This request was already completed or removed. Refresh the history before editing it.');
          return { document: existing, skipAudit: true };
        }
      }
      const before = editing ? await Model.findOne({ _id: req.params.recordId, vehicle: req.operationVehicle._id, voidedAt: null }).session(session).lean() : null;
      if (editing && !before) throw fail(404, 'Record not found.');
      if (kind === 'fuel' && !removing) {
        const rows = await FuelRecord.find({ vehicle: req.operationVehicle._id, voidedAt: null, ...(editing ? { _id: { $ne: before._id } } : {}) }).select('date odometer').session(session).lean();
        if (rows.some(row => row.date === values.date && row.odometer === values.odometer)) throw fail(409, 'A fuel entry already exists for this date and odometer.');
        if (rows.some(row => row.date < values.date && row.odometer > values.odometer || row.date > values.date && row.odometer < values.odometer)) throw fail(400, 'The odometer must follow the readings recorded on earlier and later dates.');
      }
      let document;
      if (removing) document = await Model.findByIdAndUpdate(before._id, { $set: { voidedAt: new Date(), voidedBy: req.user._id, updatedBy: req.user._id } }, { new: true, session });
      else if (editing) document = await Model.findByIdAndUpdate(before._id, { $set: { ...values, updatedBy: req.user._id } }, { new: true, runValidators: true, session });
      else [document] = await Model.create([{ ...values, requestId, requestFingerprint: fingerprint, vehicle: req.operationVehicle._id, createdBy: req.user._id, updatedBy: req.user._id }], { session });
      return { document, before, vehicle: req.operationVehicle._id, label: `${req.operationVehicle.vehicleNumber} · ${kind === 'service' ? document.category : 'Fuel'} · ${document.date}` };
    });
    // Exclude binary receipt content even when returning a freshly-created document.
    const data = record.toObject(); delete data.receiptData; delete data.requestId; delete data.requestFingerprint;
    res.status(editing ? 200 : 201).json({ data });
  } catch (error) { respondError(res, error); }
}
router.post('/:vehicleId/:kind', allowRoles('admin', 'editor'), mutateRecord);
router.patch('/:vehicleId/:kind/:recordId', allowRoles('admin', 'editor'), mutateRecord);
router.delete('/:vehicleId/:kind/:recordId', allowRoles('admin'), mutateRecord);
module.exports = router;
