// MongoDB connection utility with robust error handling for Vercel serverless
const mongoose = require('mongoose');

// Track connection state
let isConnected = false;

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds 
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  bufferCommands: false, // Disable mongoose buffering
  ssl: true,
  authSource: 'admin',
};

/**
 * Connect to MongoDB with retry logic and connection pooling
 * Optimized for serverless environments like Vercel
 */
const connectDB = async () => {
  // If already connected, return the existing connection
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  // Get MongoDB URI from environment variables
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL || 
    'mongodb://atlas-sql-686d124a38fca47bb3f5d833-jl0thv.a.query.mongodb.net/dt_vehicles_management?ssl=true&authSource=admin';
  
  if (!uri) {
    console.error('No MongoDB URI provided. Set MONGODB_URI environment variable.');
    throw new Error('MongoDB URI not found in environment variables');
  }

  try {
    // Log connection attempt without exposing credentials
    const safeUri = uri.includes('@') 
      ? `${uri.split('@')[0].split('//')[0]}//***:***@${uri.split('@')[1]}` 
      : uri;
    console.log(`Connecting to MongoDB: ${safeUri}`);
    
    // Connect with timeout
    const conn = await mongoose.connect(uri, options);
    
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.db.databaseName}`);
    
    // Set up connection error handlers
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
      isConnected = false;
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });
    
    return conn;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    
    // Provide more specific error messages for common issues
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server. Check network access and credentials.');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.error('MongoDB authentication failed. Check username and password.');
    }
    
    isConnected = false;
    throw error;
  }
};

module.exports = { connectDB };
