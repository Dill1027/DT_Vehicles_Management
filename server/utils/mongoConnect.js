// MongoDB connection utility with robust error handling for Vercel serverless
const mongoose = require('mongoose');

// Track connection state
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;

// Connection options - reduced settings for compatibility
const options = {
  // MongoDB Atlas settings - essential minimal set
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000, // Increased timeout for Vercel cold starts
  // Don't set socketTimeoutMS or family for better compatibility
  // Don't set ssl or authSource explicitly, let the connection string handle it
};

/**
 * Connect to MongoDB with retry logic and connection pooling
 * Optimized for serverless environments like Vercel
 */
const connectDB = async () => {
  // If already connected, return the existing connection
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing database connection');
    return mongoose.connection;
  }
  
  // Reset connection state if disconnected
  if (mongoose.connection.readyState !== 1) {
    isConnected = false;
  }

  // Get MongoDB URI from environment variables with fallback
  // IMPORTANT: Hardcoded URI is used as fallback for local development only
  let uri = process.env.MONGODB_URI || process.env.DATABASE_URL || 
    'mongodb://atlas-sql-686d124a38fca47bb3f5d833-jl0thv.a.query.mongodb.net/dt_vehicles_management?ssl=true&authSource=admin';
  
  if (!uri) {
    console.error('No MongoDB URI provided. Set MONGODB_URI environment variable.');
    throw new Error('MongoDB URI not found in environment variables');
  }
  
  // Add authentication if credentials are provided and not already in the URI
  const username = process.env.MONGODB_USERNAME;
  const password = process.env.MONGODB_PASSWORD;
  if (username && password && uri.startsWith('mongodb://') && !uri.includes('@')) {
    uri = uri.replace('mongodb://', `mongodb://${username}:${password}@`);
    console.log('Added authentication credentials to MongoDB URI');
  }

  try {
    // Log connection attempt without exposing credentials
    const safeUri = uri.includes('@') 
      ? `${uri.split('@')[0].split('//')[0]}//***:***@${uri.split('@')[1]}` 
      : uri;
    console.log(`[${new Date().toISOString()}] Connecting to MongoDB: ${safeUri} (Attempt ${connectionAttempts + 1})`);
    
    // For Vercel environments, try with simplified options first
    let conn;
    connectionAttempts++;
    
    try {
      // First try with minimal options for better compatibility
      conn = await mongoose.connect(uri, options);
    } catch (initialError) {
      console.warn(`Initial connection failed: ${initialError.message}. Trying with URI string options only...`);
      
      if (connectionAttempts <= MAX_RETRY_ATTEMPTS) {
        // Second attempt: Try with no options, rely on connection string parameters
        try {
          conn = await mongoose.connect(uri);
          console.log('Connected with URI parameters only');
        } catch (fallbackError) {
          throw fallbackError; // Re-throw if both attempts fail
        }
      } else {
        throw initialError;
      }
    }
    
    isConnected = true;
    console.log(`[${new Date().toISOString()}] MongoDB Connected Successfully!`);
    console.log(`Connection Host: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.db.databaseName}`);
    
    // Reset connection attempts counter after successful connection
    connectionAttempts = 0;
    
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
    console.error(`[${new Date().toISOString()}] MongoDB connection failed:`, error.message);
    
    // Provide more specific error messages for common issues
    if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to any MongoDB server. Check network access and credentials.');
    }
    
    if (error.message.includes('Authentication failed')) {
      console.error('MongoDB authentication failed. Check username and password.');
    }
    
    // Provide direct troubleshooting help
    console.error(`
TROUBLESHOOTING TIPS:
1. Check that MongoDB Atlas IP allowlist includes 0.0.0.0/0
2. Verify the database name in your connection string: ${uri.split('/').pop().split('?')[0]}
3. Check if your MongoDB Atlas username and password are correct
4. Make sure your Atlas cluster is running and not paused
`);
    
    isConnected = false;
    throw error;
  }
};

module.exports = { connectDB };
