// Test MongoDB Atlas connection
require('dotenv').config();
const mongoose = require('mongoose');

async function testAtlasConnection() {
  console.log('Testing MongoDB Atlas connection...');
  
  // Use the Atlas connection string directly
  const uri = 'mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_vehicles_management?retryWrites=true&w=majority';
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000
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
    
    // Try to find vehicles
    if (collections.some(c => c.name === 'vehicles')) {
      console.log('\nTesting vehicles collection...');
      const Vehicle = mongoose.model('Vehicle', new mongoose.Schema({}), 'vehicles');
      const count = await Vehicle.countDocuments();
      console.log(`Found ${count} vehicles in the database`);
      
      if (count > 0) {
        const sample = await Vehicle.findOne();
        console.log('Sample vehicle:', JSON.stringify(sample, null, 2).substring(0, 300) + '...');
      }
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

testAtlasConnection();
