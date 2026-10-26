const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  requestId: { type: String, select: false },
  requestFingerprint: { type: String, select: false },
  date: { type: String, required: true },
  odometer: { type: Number, min: 0, required: true },
  liters: { type: Number, min: 0.001, required: true },
  cost: { type: Number, min: 0, required: true },
  station: { type: String, default: '', maxlength: 150 },
  fullTank: { type: Boolean, default: false },
  notes: { type: String, default: '', maxlength: 2000 },
  receiptName: String, receiptMime: String,
  receiptData: { type: Buffer, select: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  voidedAt: { type: Date, default: null },
  voidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ vehicle: 1, voidedAt: 1, date: -1, odometer: -1, _id: -1 });
schema.index({ vehicle: 1, requestId: 1 }, { unique: true, partialFilterExpression: { requestId: { $type: 'string' } } });
module.exports = mongoose.models.FuelRecord || mongoose.model('FuelRecord', schema);
