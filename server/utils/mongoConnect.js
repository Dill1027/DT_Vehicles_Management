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
    'mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_vehicles_management?retryWrites=true&w=majority';
  
  if (!uri) {
    console.error('No MongoDB URI provided. Set MONGODB_URI environment variable.');
    throw new Error('MongoDB URI not found in environment variables');
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
