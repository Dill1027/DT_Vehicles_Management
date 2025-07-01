const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// Sample vehicle data with insurance expiry dates
const sampleVehicles = [
  {
    vehicleNumber: 'DT-001',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    licensePlate: 'ABC-123',
    department: 'Sales',
    type: 'Car',
    fuelType: 'Petrol',
    status: 'Active',
    mileage: 25000,
    insuranceDetails: 'Full comprehensive insurance',
    insuranceExpiry: '2025-07-15', // Expires in 2 weeks
    registrationExpiry: '2025-12-31',
    revenueExpiry: '2025-08-15',
    notes: 'Company executive vehicle'
  },
  {
    vehicleNumber: 'DT-002',
    make: 'Ford',
    model: 'Transit',
    year: 2021,
    licensePlate: 'DEF-456',
    department: 'Operations',
    type: 'Van',
    fuelType: 'Diesel',
    status: 'Out of Service',
    mileage: 45000,
    insuranceDetails: 'Commercial vehicle insurance',
    insuranceExpiry: '2025-06-25', // Expired 6 days ago
    registrationExpiry: '2025-11-30',
    revenueExpiry: '2025-07-25',
    notes: 'Delivery van - scheduled maintenance'
  },
  {
    vehicleNumber: 'DT-003',
    make: 'Mercedes',
    model: 'Sprinter',
    year: 2020,
    licensePlate: 'GHI-789',
    department: 'Operations',
    type: 'Van',
    fuelType: 'Diesel',
    status: 'Active',
    mileage: 35000,
    insuranceDetails: 'Commercial van insurance',
    insuranceExpiry: '2025-07-06', // Expires in 5 days
    registrationExpiry: '2025-10-15',
    revenueExpiry: '2025-08-06',
    notes: 'Large cargo capacity'
  },
  {
    vehicleNumber: 'DT-004',
    make: 'BMW',
    model: 'X5',
    year: 2023,
    licensePlate: 'JKL-012',
    department: 'Executive',
    type: 'Car',
    fuelType: 'Petrol',
    status: 'In Service',
    mileage: 15000,
    insuranceDetails: 'Executive vehicle insurance',
    insuranceExpiry: '2026-03-15', // Safe - expires in 8+ months
    registrationExpiry: '2025-12-31',
    revenueExpiry: '2026-04-15',
    notes: 'Executive vehicle for CEO'
  },
  {
    vehicleNumber: 'DT-005',
    make: 'Iveco',
    model: 'Daily',
    year: 2019,
    licensePlate: 'MNO-345',
    department: 'Maintenance',
    type: 'Truck',
    fuelType: 'Diesel',
    status: 'Retired',
    mileage: 78000,
    insuranceDetails: 'Heavy vehicle insurance',
    insuranceExpiry: '2025-06-15', // Expired 16 days ago
    registrationExpiry: '2025-09-30',
    revenueExpiry: '2025-07-15',
    notes: 'Heavy duty truck - needs repairs'
  }
];

const sampleUsers = [
  {
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@deeptec.com',
    password: 'password123', // Will be hashed by the model
    role: 'Admin',
    department: 'Administration',
    employeeId: 'EMP001',
    isActive: true
  },
  {
    firstName: 'John',
    lastName: 'Driver',
    email: 'john.driver@deeptec.com',
    password: 'password123',
    role: 'Driver',
    department: 'Operations',
    employeeId: 'EMP002',
    isActive: true
  },
  {
    firstName: 'Sarah',
    lastName: 'Manager',
    email: 'sarah.manager@deeptec.com',
    password: 'password123',
    role: 'Manager',
    department: 'Operations',
    employeeId: 'EMP003',
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data and drop collections to avoid index issues
    console.log('🧹 Dropping existing collections...');
    try {
      await mongoose.connection.db.dropCollection('vehicles');
      console.log('✅ Vehicles collection dropped');
    } catch (error) {
      console.log('ℹ️ Vehicles collection did not exist:', error.message);
    }
    
    try {
      await mongoose.connection.db.dropCollection('users');
      console.log('✅ Users collection dropped');
    } catch (error) {
      console.log('ℹ️ Users collection did not exist:', error.message);
    }

    // Insert sample vehicles
    console.log('🚗 Inserting sample vehicles...');
    const vehicles = await Vehicle.insertMany(sampleVehicles);
    console.log(`✅ Inserted ${vehicles.length} vehicles`);

    // Insert sample users
    console.log('👥 Inserting sample users...');
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Inserted ${users.length} users`);

    console.log('🎉 Database seeded successfully!');
    console.log(`
📊 Summary:
   - Vehicles: ${vehicles.length}
   - Users: ${users.length}
   
🚨 Insurance Alerts:
   - DT-002: Expired 6 days ago
   - DT-005: Expired 16 days ago
   - DT-003: Expires in 5 days
   - DT-001: Expires in 14 days
   - DT-004: Safe (8+ months)
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeding script
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
