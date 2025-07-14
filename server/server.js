const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const path = require('path');

const vehicleRoutes = require('./routes/vehicleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 5002; // Changed to 5002 to match client config

// Security middleware
app.use(helmet());

// CORS configuration - simplified for Vercel deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // In production, allow Vercel domains and localhost for development
    const allowedPatterns = [
      'localhost',
      '127.0.0.1',
      'dt-vehicles-frontend',
      'vercel.app'
    ];
    
    const isAllowed = allowedPatterns.some(pattern => origin.includes(pattern));
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    console.log(`CORS blocked origin: ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors());

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Very high limit for development
  skip: (req) => {
    // Skip rate limiting for development environment
    return process.env.NODE_ENV !== 'production';
  },
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory with enhanced CORS headers
app.use('/uploads', (req, res, next) => {
  // Add permissive CORS headers for images and static content
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Request logging middleware for debugging
app.use((req, res, next) => {
  // Only log requests with Authorization header to avoid spam
  if (req.headers.authorization) {
    console.log(`🔍 Request: ${req.method} ${req.url}`, {
      hasAuth: !!req.headers.authorization,
      authType: req.headers.authorization?.split(' ')[0],
      contentType: req.headers['content-type'],
      userAgent: req.headers['user-agent']?.substring(0, 50) + '...',
      timestamp: new Date().toISOString()
    });
  }
  next();
});

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    res.status(200).json({
      status: 'OK',
      message: 'DT Vehicles Management API is running',
      timestamp: new Date().toISOString(),
      cors: 'enabled',
      mongodb: dbStatus,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Test endpoint to debug CORS
app.get('/api/test', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    message: 'Test endpoint working',
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error.message && error.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS error',
      error: error.message,
      origin: req.headers.origin
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Database connection
const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!mongoUri) {
  console.error('❌ MONGODB_URI environment variable is not set');
  console.log('Please set MONGODB_URI in your .env file');
  process.exit(1);
}

// For Vercel, we need to connect to MongoDB on each request
// This is a connection management for serverless environments
let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    console.log(`Attempting to connect to MongoDB...`);
    
    const connection = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0 // Disable mongoose buffering
    });

    console.log('✅ Connected to MongoDB successfully');
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Initialize database connection
connectToDatabase().catch(console.error);

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Deep Tec Vehicle Management Server is running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🌐 Health Check: http://localhost:${PORT}/api/health`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      console.log('🔧 Please stop other services running on this port or change the PORT in .env file');
      process.exit(1);
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });
}

module.exports = app;
