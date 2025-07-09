// Test MongoDB connection with dt_vehicles_management database
require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('Testing MongoDB connection with dt_vehicles_management database...');
  
  // Use the correct database connection string directly
  const uri = 'mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_vehicles_management';
  
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connection successful!');
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.db.databaseName);
    console.log('Connection Host:', conn.connection.host);
    
    // Try a simple operation
    console.log('\nTesting a simple database operation...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`);
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    // Try to create a test collection if none exist
    if (collections.length === 0) {
      console.log('\nCreating a test collection...');
      await mongoose.connection.db.createCollection('test_vehicles');
      console.log('Test collection created');
      
      // Verify the collection was created
      const updatedCollections = await mongoose.connection.db.listCollections().toArray();
      console.log(`After creation: Found ${updatedCollections.length} collections:`);
      updatedCollections.forEach((collection, index) => {
        console.log(`${index + 1}. ${collection.name}`);
      });
    }
    
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
  }
}

testConnection();
