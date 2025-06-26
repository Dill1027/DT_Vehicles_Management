const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Seed data for different user types
const seedUsers = [
  {
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@deeptec.com',
    password: 'admin@123',
    role: 'admin',
    department: 'Administration',
    employeeId: 'ADMIN001',
    phoneNumber: '+1234567890'
  },
  {
    firstName: 'Fleet',
    lastName: 'Manager',
    email: 'manager@deeptec.com',
    password: 'manager123',
    role: 'fleet_manager',
    department: 'Operations',
    employeeId: 'MGR001',
    phoneNumber: '+1234567891'
  },
  {
    firstName: 'John',
    lastName: 'Driver',
    email: 'driver@deeptec.com',
    password: 'driver123',
    role: 'driver',
    department: 'Operations',
    employeeId: 'DRV001',
    phoneNumber: '+1234567892',
    licenseNumber: 'DL123456789',
    licenseExpiry: new Date('2025-12-31')
  },
  {
    firstName: 'Mike',
    lastName: 'Mechanic',
    email: 'mechanic@deeptec.com',
    password: 'mechanic123',
    role: 'staff',
    department: 'Maintenance',
    employeeId: 'MECH001',
    phoneNumber: '+1234567893'
  },
  {
    firstName: 'Sarah',
    lastName: 'Viewer',
    email: 'viewer@deeptec.com',
    password: 'viewer123',
    role: 'staff',
    department: 'Administration',
    employeeId: 'VIEW001',
    phoneNumber: '+1234567894'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('🌱 Starting database seeding...\n');
    
    // Create users
    const createdUsers = [];
    const existingUsers = [];
    
    for (const userData of seedUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          $or: [
            { email: userData.email },
            { employeeId: userData.employeeId }
          ]
        });
        
        if (existingUser) {
          console.log(`⚠️  User already exists: ${userData.email} (${userData.role})`);
          existingUsers.push(userData);
          continue;
        }
        
        // Create new user
        const user = new User(userData);
        await user.save();
        
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
        createdUsers.push(userData);
        
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }
    
    // Display summary
    console.log('\n' + '=' .repeat(80));
    console.log('🎉 DATABASE SEEDING COMPLETED!');
    console.log('=' .repeat(80));
    
    if (createdUsers.length > 0) {
      console.log('\n📋 NEWLY CREATED USERS:');
      console.log('-' .repeat(80));
      createdUsers.forEach(user => {
        console.log(`👤 ${user.role.padEnd(10)} | ${user.email.padEnd(25)} | ${user.password}`);
      });
    }
    
    if (existingUsers.length > 0) {
      console.log('\n📋 EXISTING USERS (not created):');
      console.log('-' .repeat(80));
      existingUsers.forEach(user => {
        console.log(`👤 ${user.role.padEnd(10)} | ${user.email.padEnd(25)} | (existing)`);
      });
    }
    
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('-' .repeat(80));
    console.log('Format: Role | Email | Password');
    console.log('-' .repeat(80));
    seedUsers.forEach(user => {
      console.log(`${user.role.padEnd(10)} | ${user.email.padEnd(25)} | ${user.password}`);
    });
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Start your server: npm run dev');
    console.log('2. Start your client: npm start');
    console.log('3. Visit: http://localhost:3000');
    console.log('4. Login with any of the above credentials');
    console.log('5. ⚠️  Change passwords in production!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
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

// Check command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('🚗 DT Vehicles Management - Database Seeding Script');
  console.log('=' .repeat(60));
  console.log('Usage: node seedDatabase.js');
  console.log('');
  console.log('This script creates test users with different roles:');
  console.log('- Admin: Full system access');
  console.log('- Manager: Vehicle and user management');
  console.log('- Driver: Limited access, can view assigned vehicles');
  console.log('- Mechanic: Maintenance management');
  console.log('- Viewer: Read-only access');
  console.log('');
  console.log('⚠️  Warning: Only use in development environment!');
  process.exit(0);
}

// Run the seeding
console.log('🚗 DT Vehicles Management - Database Seeding Script');
console.log('=' .repeat(60));
seedDatabase();
