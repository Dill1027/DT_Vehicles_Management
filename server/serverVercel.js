const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Import the enhanced MongoDB connection utility
const { connectDB } = require('./utils/mongoConnect');

const vehicleRoutes = require('./routes/vehicleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration - permissive for debugging
const corsOptions = {
  origin: '*', // Allow all origins for debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

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
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
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
      message: 'DT Vehicles Management API is running on Vercel',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        state: dbStateText,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
      memoryUsage: process.memoryUsage(),
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

// Error handling middleware
app.use((err, req, res, next) => {
  // Log the error with timestamp and request info
  console.error(`[${new Date().toISOString()}] Error processing ${req.method} ${req.url}:`, err);
  
  // Determine if we should show detailed errors
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Create a structured error response
  const errorResponse = {
    success: false,
    message: 'A server error has occurred',
    error: isProduction ? 
      { code: '500', message: 'A server error has occurred' } : 
      { 
        code: '500', 
        message: err.message, 
        stack: err.stack,
        path: req.path,
        method: req.method
      }
  };
  
  // Add additional context for MongoDB errors
  if (err.name === 'MongoError' || err.name === 'MongoServerSelectionError') {
    errorResponse.error.type = 'database';
    errorResponse.message = 'Database error occurred';
  }
  
  res.status(500).json(errorResponse);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Export the Express app for serverless deployment
module.exports = app;
