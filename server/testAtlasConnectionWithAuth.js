// Test MongoDB Atlas SQL connection with username and password
require('dotenv').config();
const mongoose = require('mongoose');

async function testAtlasConnectionWithAuth() {
  console.log('Testing MongoDB Atlas SQL connection with authentication...');
  
  // Prompt for credentials or use environment variables
  const username = process.env.MONGODB_USERNAME || '';
  const password = process.env.MONGODB_PASSWORD || '';
  
  // Base connection string
  const baseUri = 'mongodb://atlas-sql-686d124a38fca47bb3f5d833-jl0thv.a.query.mongodb.net/dt_vehicles_management?ssl=true&authSource=admin';
  
  // Add username and password if provided
  let uri = baseUri;
  if (username && password) {
    // Insert credentials into connection string
    uri = baseUri.replace('mongodb://', `mongodb://${username}:${password}@`);
  }
  
  try {
    console.log('Connecting to MongoDB Atlas...');
    // Hide credentials in log output
    const safeUri = uri.includes('@') 
      ? `mongodb://***:***@${uri.split('@')[1]}` 
      : uri;
    console.log('Using connection URI:', safeUri);
    
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
    
    console.log('\n✅ Database operation successful!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error(error);
    console.log('\nTroubleshooting tips:');
    console.log('1. Verify your username and password are correct');
    console.log('2. Check that the database name exists in your MongoDB Atlas cluster');
    console.log('3. Ensure your IP is whitelisted in MongoDB Atlas Network Access');
    console.log('4. Check if the connection string format is correct for your Atlas account type');
  } finally {
    // Close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('Connection closed.');
    }
  }
}

testAtlasConnectionWithAuth();
