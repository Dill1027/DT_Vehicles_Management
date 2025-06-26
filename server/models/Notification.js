const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['insurance_expiry', 'emission_expiry', 'revenue_expiry', 'maintenance_due', 'license_expiry', 'general'],
    required: [true, 'Notification type is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: function() {
      return ['insurance_expiry', 'emission_expiry', 'revenue_expiry', 'maintenance_due'].includes(this.type);
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.type === 'license_expiry';
    }
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    }
  }],
  scheduledFor: {
    type: Date,
    required: true
  },
  sent: {
    type: Boolean,
    default: false
  },
  sentAt: {
    type: Date
  },
  expiryDate: {
    type: Date,
    required: function() {
      return ['insurance_expiry', 'emission_expiry', 'revenue_expiry', 'license_expiry'].includes(this.type);
    }
  },
  daysUntilExpiry: {
    type: Number
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate daysUntilExpiry
notificationSchema.pre('save', function(next) {
  if (this.expiryDate) {
    const now = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry - now;
    this.daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  next();
});

// Index for efficient queries
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ sent: 1 });
notificationSchema.index({ vehicle: 1 });
notificationSchema.index({ 'recipients.user': 1 });
notificationSchema.index({ 'recipients.read': 1 });
notificationSchema.index({ expiryDate: 1 });
notificationSchema.index({ createdAt: 1 });

// Method to mark notification as read for a specific user
notificationSchema.methods.markAsRead = function(userId) {
  const recipient = this.recipients.find(r => r.user.toString() === userId.toString());
  if (recipient) {
    recipient.read = true;
    recipient.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to get unread notifications for a user
notificationSchema.statics.getUnreadForUser = function(userId) {
  return this.find({
    'recipients.user': userId,
    'recipients.read': false,
    sent: true
  }).populate('vehicle', 'vehicleNumber modelMake type')
    .populate('user', 'firstName lastName email')
    .sort({ createdAt: -1 });
};

// Static method to get notifications due to be sent
notificationSchema.statics.getDueNotifications = function() {
  const now = new Date();
  return this.find({
    scheduledFor: { $lte: now },
    sent: false
  }).populate('vehicle', 'vehicleNumber modelMake type assignedDriver')
    .populate('user', 'firstName lastName email')
    .populate('recipients.user', 'firstName lastName email notificationPreferences');
};

module.exports = mongoose.model('Notification', notificationSchema);
