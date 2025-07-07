// Minimal serverless API for testing
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Simple CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// MongoDB connection cache
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI not set');
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB error:', error.message);
    throw error;
  }
};

// Test endpoint
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({
      status: 'OK',
      message: 'API is working',
      timestamp: new Date().toISOString(),
      mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      env: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

// Simple vehicles endpoint
app.get('/api/vehicles', async (req, res) => {
  try {
    await connectDB();
    
    // Import Vehicle model here to avoid early requires
    const Vehicle = mongoose.model('Vehicle') || require('../models/Vehicle');
    
    const vehicles = await Vehicle.find({}).limit(10);
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
});

module.exports = app;
