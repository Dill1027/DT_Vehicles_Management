const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  actor: { id: mongoose.Schema.Types.ObjectId, name: String, email: String, role: String },
  action: { type: String, required: true, index: true },
  entityType: { type: String, required: true, index: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  label: { type: String, required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', index: true },
  changes: [{ _id: false, field: String, before: mongoose.Schema.Types.Mixed, after: mongoose.Schema.Types.Mixed }]
}, { timestamps: { createdAt: true, updatedAt: false } });
schema.index({ createdAt: -1, _id: -1 });
module.exports = mongoose.models.ActivityLog || mongoose.model('ActivityLog', schema);
