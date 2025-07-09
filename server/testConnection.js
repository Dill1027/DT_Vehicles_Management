// Test MongoDB connection
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./utils/mongoConnect');

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MongoDB URI available:', !!process.env.MONGODB_URI);
  
  try {
    await connectDB();
    console.log('✅ Connection successful!');
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.db.databaseName);
    
    // Try a simple operation
    console.log('\nTesting a simple database operation...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    console.log('\n✅ Database operation successful!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error(error);
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Connection closed.');
    }
    process.exit(0);
  }
}

testConnection();
