const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  requestId: { type: String, select: false },
  requestFingerprint: { type: String, select: false },
  date: { type: String, required: true },
  category: { type: String, enum: ['Service', 'Repair', 'Tyres', 'Battery', 'Other'], required: true },
  description: { type: String, required: true, maxlength: 1000 },
  provider: { type: String, default: '', maxlength: 150 },
  odometer: { type: Number, min: 0, required: true },
  cost: { type: Number, min: 0, required: true },
  nextServiceDate: { type: String, default: '' },
  nextServiceMileage: { type: Number, min: 0, default: null },
  notes: { type: String, default: '', maxlength: 2000 },
  receiptName: String, receiptMime: String,
  receiptData: { type: Buffer, select: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  voidedAt: { type: Date, default: null },
  voidedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
schema.index({ vehicle: 1, voidedAt: 1, date: -1, _id: -1 });
schema.index({ vehicle: 1, requestId: 1 }, { unique: true, partialFilterExpression: { requestId: { $type: 'string' } } });
module.exports = mongoose.models.ServiceRecord || mongoose.model('ServiceRecord', schema);
