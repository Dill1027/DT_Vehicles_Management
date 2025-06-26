const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  type: {
    type: String,
    required: [true, 'Maintenance type is required'],
    enum: ['Scheduled', 'Preventive', 'Repair', 'Emergency', 'Inspection', 'Recall']
  },
  category: {
    type: String,
    required: [true, 'Maintenance category is required'],
    enum: [
      'Engine',
      'Transmission',
      'Brakes',
      'Tires',
      'Oil Change',
      'Battery',
      'Air Filter',
      'Cooling System',
      'Electrical',
      'Suspension',
      'Exhaust',
      'Body Work',
      'Interior',
      'Safety Systems',
      'Other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Maintenance description is required'],
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  startDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  status: {
    type: String,
    required: [true, 'Maintenance status is required'],
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Overdue'],
    default: 'Scheduled'
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  assignedMechanic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  workshop: {
    name: String,
    address: String,
    contactNumber: String,
    email: String
  },
  cost: {
    labor: {
      type: Number,
      min: [0, 'Labor cost cannot be negative'],
      default: 0
    },
    parts: {
      type: Number,
      min: [0, 'Parts cost cannot be negative'],
      default: 0
    },
    other: {
      type: Number,
      min: [0, 'Other cost cannot be negative'],  
      default: 0
    },
    total: {
      type: Number,
      min: [0, 'Total cost cannot be negative'],
      default: 0
    }
  },
  partsUsed: [{
    name: String,
    partNumber: String,
    quantity: Number,
    unitCost: Number,
    supplier: String
  }],
  mileageAtService: {
    type: Number,
    min: [0, 'Mileage cannot be negative']
  },
  nextServiceMileage: {
    type: Number,
    min: [0, 'Next service mileage cannot be negative']
  },
  nextServiceDate: {
    type: Date
  },
  documents: [{
    name: String,
    url: String,
    type: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  images: [{
    url: String,
    description: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  workOrder: {
    type: String,
    trim: true
  },
  warranty: {
    isUnderWarranty: {
      type: Boolean,
      default: false
    },
    warrantyProvider: String,
    warrantyExpiry: Date,
    warrantyDetails: String
  },
  approval: {
    isRequired: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedDate: Date,
    approvalNotes: String
  }
}, {
  timestamps: true
});

// Indexes
maintenanceSchema.index({ vehicle: 1 });
maintenanceSchema.index({ status: 1 });
maintenanceSchema.index({ type: 1 });
maintenanceSchema.index({ scheduledDate: 1 });
maintenanceSchema.index({ assignedMechanic: 1 });
maintenanceSchema.index({ priority: 1 });

// Pre-save middleware to calculate total cost
maintenanceSchema.pre('save', function(next) {
  if (this.isModified('cost.labor') || this.isModified('cost.parts') || this.isModified('cost.other')) {
    this.cost.total = (this.cost.labor || 0) + (this.cost.parts || 0) + (this.cost.other || 0);
  }
  next();
});

// Virtual for duration
maintenanceSchema.virtual('duration').get(function() {
  if (this.startDate && this.completedDate) {
    const diffTime = Math.abs(this.completedDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
  }
  return null;
});

// Virtual for overdue status
maintenanceSchema.virtual('isOverdue').get(function() {
  if (this.status === 'Completed' || this.status === 'Cancelled') {
    return false;
  }
  return new Date() > this.scheduledDate;
});

// Ensure virtual fields are serialized
maintenanceSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
