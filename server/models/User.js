const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
  tokenVersion: { type: Number, default: 0, select: false }
}, { timestamps: true });
module.exports = mongoose.models.User || mongoose.model('User', schema);
