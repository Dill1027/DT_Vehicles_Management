const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    required: [true, 'User role is required'],
    enum: ['Admin', 'Manager', 'Driver', 'Mechanic', 'Viewer'],
    default: 'Viewer'
  },
  permissions: [{
    type: String,
    enum: [
      'vehicles.view',
      'vehicles.create',
      'vehicles.edit',
      'vehicles.delete',
      'reports.view',
      'reports.export',
      'notifications.manage',
      'users.manage',
      'system.admin'
    ]
  }],
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number']
  },
  licenseNumber: {
    type: String,
    trim: true
  },
  licenseExpiry: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  profileImage: {
    type: String
  },
  assignedVehicles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  }],
  // Notification Preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'immediate'
    }
  },
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Check if user has permission
userSchema.methods.hasPermission = function(permission) {
  if (!this.permissions) return false;
  
  // Map permission strings to permission object properties
  const permissionMap = {
    'vehicles.view': 'canViewVehicles',
    'vehicles.create': 'canEditVehicles',
    'vehicles.edit': 'canEditVehicles', 
    'vehicles.delete': 'canDeleteVehicles',
    'users.manage': 'canManageUsers',
    'reports.view': 'canViewReports',
    'reports.export': 'canViewReports',
    'maintenance.manage': 'canManageMaintenance'
  };
  
  const permissionKey = permissionMap[permission];
  return permissionKey ? this.permissions[permissionKey] : false;
};

// Set permissions based on role
userSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch (this.role) {
      case 'Admin':
        this.permissions = [
          'vehicles.view',
          'vehicles.create', 
          'vehicles.edit',
          'vehicles.delete',
          'reports.view',
          'reports.export',
          'notifications.manage',
          'users.manage',
          'system.admin'
        ];
        break;
      case 'Manager':
        this.permissions = [
          'vehicles.view',
          'vehicles.create',
          'vehicles.edit',
          'reports.view',
          'reports.export',
          'notifications.manage'
        ];
        break;
      case 'Driver':
        this.permissions = [
          'vehicles.view'
        ];
        break;
      case 'Mechanic':
        this.permissions = [
          'vehicles.view',
          'vehicles.edit'
        ];
        break;
      default: // Viewer
        this.permissions = [
          'vehicles.view'
        ];
    }
  }
  next();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
