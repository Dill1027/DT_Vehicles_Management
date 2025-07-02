// Create a default admin user if no users exist
// This ensures there's always a way to access the system

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createDefaultAdmin = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Check if any users exist
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('👤 No users found. Creating default admin user...');
      
      const defaultAdmin = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@deeptec.com',
        password: 'admin123', // Will be hashed automatically by the model
        role: 'Admin',
        department: 'Administration',
        employeeId: 'ADMIN001',
        isActive: true,
        permissions: [
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
      };

      const admin = new User(defaultAdmin);
      await admin.save();
      
      console.log('✅ Default admin user created successfully!');
      console.log('📧 Email: admin@deeptec.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  Please change the password after first login');
    } else {
      console.log(`ℹ️ Users already exist (${userCount} users found). No default admin needed.`);
    }
    
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the admin creation process
createDefaultAdmin();
