// Clear all data from MongoDB database
// This script will remove all vehicles and other data from the database

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const Vehicle = require('../models/Vehicle');
const Notification = require('../models/Notification');

const clearDatabase = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    console.log('🧹 Clearing all data from database...');
    
    // Drop collections completely to remove all data and indexes
    try {
      await mongoose.connection.db.dropCollection('vehicles');
      console.log('✅ Vehicles collection cleared');
    } catch (error) {
      console.log('ℹ️ Vehicles collection was already empty:', error.message);
    }
    
    try {
      await mongoose.connection.db.dropCollection('notifications');
      console.log('✅ Notifications collection cleared');
    } catch (error) {
      console.log('ℹ️ Notifications collection was already empty:', error.message);
    }

    console.log('🎉 Database completely cleared!');
    console.log('');
    console.log('📝 Database is now empty and ready for fresh data input');
    console.log('🔧 You can now add vehicles through the application forms');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the clearing process
clearDatabase();
