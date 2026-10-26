const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const VEHICLE_FIELDS = ['vehicleNumber', 'make', 'model', 'year', 'type', 'department', 'assignedTo', 'status', 'condition', 'fuelType', 'mileage', 'monthStartMileage', 'monthEndMileage', 'insuranceExpiry', 'licenseExpiry', 'emissionExpiry', 'revenueExpiry', 'registrationExpiry', 'serviceDate', 'nextServiceDue', 'nextMaintenanceDate', 'maintenanceNotes', 'notes', 'archivedAt'];
const FIELDS = {
  vehicle: VEHICLE_FIELDS,
  user: ['name', 'email', 'role'],
  service: ['date', 'category', 'description', 'provider', 'odometer', 'cost', 'nextServiceDate', 'nextServiceMileage', 'notes', 'receiptName', 'voidedAt'],
  fuel: ['date', 'odometer', 'liters', 'cost', 'station', 'fullTank', 'notes', 'receiptName', 'voidedAt']
};
function safeSnapshot(type, record) {
  if (!record) return {};
  return Object.fromEntries((FIELDS[type] || []).map(field => {
    const value = record[field];
    return [field, value instanceof Date ? value.toISOString() : value ?? null];
  }));
}
function changedFields(type, before, after) {
  const left = safeSnapshot(type, before), right = safeSnapshot(type, after);
  return [...new Set([...Object.keys(left), ...Object.keys(right)])].filter(field => JSON.stringify(left[field] ?? null) !== JSON.stringify(right[field] ?? null)).map(field => ({ field, before: left[field] ?? null, after: right[field] ?? null }));
}
// A mutation and its activity entry commit together or both roll back.
async function auditedWrite(actor, action, entityType, mutate) {
  const session = await mongoose.startSession();
  let result;
  try {
    await session.withTransaction(async () => {
      const change = await mutate(session);
      if (!change?.document) { const error = new Error('Record not found.'); error.status = 404; throw error; }
      const document = change.document;
      if (!change.skipAudit) await ActivityLog.create([{
        actor: { id: actor._id, name: actor.name, email: actor.email, role: actor.role }, action, entityType,
        entityId: document._id, label: change.label || document.vehicleNumber || document.email || `${entityType} record`, vehicle: change.vehicle || (entityType === 'vehicle' ? document._id : undefined),
        changes: [...changedFields(entityType, change.before, change.after ?? document), ...(change.extraChanges || [])]
      }], { session });
      result = document;
    });
    return result;
  } finally { await session.endSession(); }
}
module.exports = { auditedWrite, changedFields, safeSnapshot, VEHICLE_FIELDS };
