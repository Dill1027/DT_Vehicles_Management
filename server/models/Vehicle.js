const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  // Primary vehicle identifiers
  vehicleNumber: { 
    type: String, 
    required: [true, 'Vehicle number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  make: {
    type: String,
    required: [true, 'Make is required'],
    trim: true
  },
  model: {
    type: String,
    trim: true,
    default: 'Unknown'
  },
  modelMake: { 
    type: String, 
    trim: true
  },
  year: {
    type: Number,
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  type: { 
    type: String, 
    required: [true, 'Vehicle type is required'],
    enum: ['Car', 'Van', 'Truck', 'Bus', 'Motorcycle', 'Pickup', 'Heavy Machinery', 'Other'],
    trim: true
  },
  
  // Deep Tec Engineering specific fields
  department: {
    type: String,
    enum: ['Engineering', 'Operations', 'Administration', 'Sales', 'Maintenance', 'Executive'],
    default: 'Operations'
  },
  assignedTo: {
    type: String,
    trim: true
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Legal documentation (Critical for compliance)
  insuranceDetails: { 
    type: String, 
    trim: true,
    default: 'Not specified'
  },
  insuranceExpiry: {
    type: Date,
    required: [true, 'Insurance expiry date is required'],
    index: true // For efficient expiry queries
  },
  emissionExpiry: {
    type: Date,
    index: true
  },
  revenueExpiry: {
    type: Date,
    required: [true, 'Revenue license expiry is required'],
    index: true
  },
  registrationExpiry: {
    type: Date,
    index: true
  },
  
  // Financial information
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number,
    min: [0, 'Purchase price cannot be negative']
  },
  leaseDue: {
    type: Date,
    index: true
  },
  leaseProvider: {
    type: String,
    trim: true
  },
  
  // Vehicle specifications
  mileage: {
    type: Number,
    min: [0, 'Mileage cannot be negative'],
    default: 0
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'],
    default: 'Petrol'
  },
  engineCapacity: {
    type: String,
    trim: true
  },
  
  // Maintenance and service tracking
  serviceDate: {
    type: Date
  },
  nextServiceDue: {
    type: Date,
    index: true
  },
  lastMaintenanceDate: {
    type: Date
  },
  nextMaintenanceDate: {
    type: Date,
    index: true
  },
  tyreBatteryHistory: {
    type: String,
    trim: true
  },
  maintenanceNotes: {
    type: String,
    trim: true
  },
  
  // Status and condition
  status: {
    type: String,
    enum: ['Active', 'In Service', 'Out of Service', 'Retired', 'Pending'],
    default: 'Active'
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
    default: 'Good'
  },
  
  // Media and documentation
  imageUrl: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    description: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Notification tracking for expiry alerts
  notifications: {
    insuranceAlerts: [{
      alertDate: Date,
      daysUntilExpiry: Number,
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      method: {
        type: String,
        enum: ['email', 'app', 'sms'],
        default: 'email'
      }
    }],
    emissionAlerts: [{
      alertDate: Date,
      daysUntilExpiry: Number,
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      method: {
        type: String,
        enum: ['email', 'app', 'sms'],
        default: 'email'
      }
    }],
    revenueAlerts: [{
      alertDate: Date,
      daysUntilExpiry: Number,
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      method: {
        type: String,
        enum: ['email', 'app', 'sms'],
        default: 'email'
      }
    }],
    serviceAlerts: [{
      alertDate: Date,
      daysUntilService: Number,
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      method: {
        type: String,
        enum: ['email', 'app', 'sms'],
        default: 'email'
      }
    }]
  },
  
  // Additional information
  notes: {
    type: String,
    trim: true
  },
  
  // Audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create compound index for modelMake from make and model
vehicleSchema.pre('save', function(next) {
  if (this.make && this.model) {
    this.modelMake = `${this.make} ${this.model}`;
  }
  next();
});

// Indexes for better performance
vehicleSchema.index({ vehicleNumber: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ type: 1 });
vehicleSchema.index({ modelMake: 1 });
vehicleSchema.index({ make: 1, model: 1 });
vehicleSchema.index({ department: 1 });
vehicleSchema.index({ assignedDriver: 1 });
vehicleSchema.index({ insuranceExpiry: 1 });
vehicleSchema.index({ emissionExpiry: 1 });
vehicleSchema.index({ revenueExpiry: 1 });
vehicleSchema.index({ nextMaintenanceDate: 1 });
vehicleSchema.index({ insuranceExpiry: 1, emissionExpiry: 1, revenueExpiry: 1 });
vehicleSchema.index({ department: 1, status: 1 });
vehicleSchema.index({ type: 1, department: 1 });

// Virtual for vehicle display name
vehicleSchema.virtual('displayName').get(function() {
  if (this.year && this.make && this.model) {
    return `${this.year} ${this.make} ${this.model}`;
  }
  return this.modelMake || `${this.make || ''} ${this.model || ''}`.trim();
});

// Virtual for checking if vehicle is overdue for maintenance
vehicleSchema.virtual('isMaintenanceOverdue').get(function() {
  return this.nextMaintenanceDate && this.nextMaintenanceDate < new Date();
});

// Virtual for checking if insurance is expiring soon (within 30 days)
vehicleSchema.virtual('isInsuranceExpiringSoon').get(function() {
  if (!this.insuranceExpiry) return false;
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  return this.insuranceExpiry <= thirtyDaysFromNow;
});

// Virtual for days until insurance expiry
vehicleSchema.virtual('daysUntilInsuranceExpiry').get(function() {
  if (!this.insuranceExpiry) return null;
  const today = new Date();
  const diffTime = this.insuranceExpiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until emission expiry
vehicleSchema.virtual('daysUntilEmissionExpiry').get(function() {
  if (!this.emissionExpiry) return null;
  const today = new Date();
  const diffTime = this.emissionExpiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days until revenue expiry
vehicleSchema.virtual('daysUntilRevenueExpiry').get(function() {
  if (!this.revenueExpiry) return null;
  const today = new Date();
  const diffTime = this.revenueExpiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to check if any document is expiring soon
vehicleSchema.methods.getExpiryAlerts = function() {
  const alerts = [];
  const today = new Date();
  
  [
    { field: 'insuranceExpiry', name: 'Insurance' },
    { field: 'emissionExpiry', name: 'Emission Test' },
    { field: 'revenueExpiry', name: 'Revenue License' },
    { field: 'registrationExpiry', name: 'Registration' },
    { field: 'leaseDue', name: 'Lease' },
    { field: 'nextServiceDue', name: 'Service' }
  ].forEach(doc => {
    if (this[doc.field]) {
      const daysUntilExpiry = Math.ceil((this[doc.field] - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
        alerts.push({
          document: doc.name,
          field: doc.field,
          expiryDate: this[doc.field],
          daysRemaining: daysUntilExpiry,
          priority: daysUntilExpiry <= 7 ? 'high' : daysUntilExpiry <= 15 ? 'medium' : 'low'
        });
      } else if (daysUntilExpiry < 0) {
        alerts.push({
          document: doc.name,
          field: doc.field,
          expiryDate: this[doc.field],
          daysRemaining: daysUntilExpiry,
          priority: 'expired'
        });
      }
    }
  });
  
  return alerts;
};

// Static method to get vehicles with expiring documents
vehicleSchema.statics.getExpiringVehicles = function(days = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    $or: [
      { insuranceExpiry: { $lte: futureDate, $gte: new Date() } },
      { emissionExpiry: { $lte: futureDate, $gte: new Date() } },
      { revenueExpiry: { $lte: futureDate, $gte: new Date() } },
      { registrationExpiry: { $lte: futureDate, $gte: new Date() } },
      { leaseDue: { $lte: futureDate, $gte: new Date() } },
      { nextServiceDue: { $lte: futureDate, $gte: new Date() } }
    ]
  });
};

// Static method to get expired vehicles
vehicleSchema.statics.getExpiredVehicles = function() {
  const today = new Date();
  
  return this.find({
    $or: [
      { insuranceExpiry: { $lt: today } },
      { emissionExpiry: { $lt: today } },
      { revenueExpiry: { $lt: today } },
      { registrationExpiry: { $lt: today } }
    ]
  });
};

// Pre-save middleware to update modification tracking
vehicleSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Ensure virtual fields are serialized
vehicleSchema.set('toJSON', { virtuals: true });
vehicleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
