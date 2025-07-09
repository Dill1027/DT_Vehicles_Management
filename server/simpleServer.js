// Simplified server for Vercel
// No serverless-http, just direct Express
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import the MongoDB connection utility
const { connectDB } = require('./utils/mongoConnect');

// Import routes and middleware
const vehicleRoutes = require('./routes/vehicleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const corsMiddleware = require('./middleware/corsMiddleware');

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration - permissive for deployment
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  optionsSuccessStatus: 204
}));

// Add preflight CORS handling for all routes
app.options('*', cors());

// Apply custom CORS middleware to all routes
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Handle MongoDB connection before each request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection error',
      error: error.message
    });
  }
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  // Add extra CORS headers for the health endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  
  try {
    await connectDB();
    
    // Get MongoDB connection info
    const dbState = mongoose.connection.readyState;
    const dbStateText = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    }[dbState] || 'unknown';
    
    res.status(200).json({
      status: 'OK',
      message: 'DT Vehicles Management API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        state: dbStateText,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Root path handler
app.get('/', (req, res) => {
  // Add extra CORS headers for the root endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  
  res.status(200).json({
    message: 'DT Vehicles Management API',
    version: '1.0.0',
    docs: '/api/health'
  });
});

// 404 handler for all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error processing ${req.method} ${req.url}:`, err);
  
  res.status(500).json({
    success: false,
    message: 'A server error occurred',
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// For local development
const PORT = process.env.PORT || 5002;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

// Export for Vercel
module.exports = app;
