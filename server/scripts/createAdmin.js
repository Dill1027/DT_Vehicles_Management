const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@deeptec.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists with email: admin@deeptec.com');
      console.log('📧 Email: admin@deeptec.com');
      console.log('🔑 Try using the existing password or create with different email');
      return;
    }
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@deeptec.com',
      password: 'admin123', // This will be hashed automatically by the User model
      role: 'Admin',
      department: 'Administration',
      employeeId: 'ADMIN001',
      phoneNumber: '+1234567890',
      isActive: true
    });
    
    await adminUser.save();
    
    console.log('\n🎉 Admin user created successfully!');
    console.log('=' .repeat(50));
    console.log('📧 Email: admin@deeptec.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: Admin');
    console.log('🏢 Department: Administration');
    console.log('🆔 Employee ID: ADMIN001');
    console.log('📱 Phone: +1234567890');
    console.log('=' .repeat(50));
    console.log('\n🚀 You can now login to the system using these credentials!');
    console.log('⚠️  Remember to change the password after first login in production!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      console.error(`❌ Duplicate ${duplicateField}: A user with this ${duplicateField} already exists`);
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Process interrupted');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Process terminated');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the script
console.log('🚗 DT Vehicles Management - Admin User Creation Script');
console.log('=' .repeat(60));
createAdmin();
