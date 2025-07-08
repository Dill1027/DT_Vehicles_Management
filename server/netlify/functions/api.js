// Netlify Function for DT Vehicles Management API
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Enhanced CORS configuration for Netlify
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://dtvehicledetails.netlify.app',
      'https://dt-vehicles-management.vercel.app',
      /\.netlify\.app$/,
      /\.vercel\.app$/
    ];
    
    // Check if origin matches any allowed origins or patterns
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      return allowedOrigin.test(origin);
    });
    
    if (isAllowed || !origin) {
      return callback(null, true);
    }
    
    // Log the origin for debugging
    console.log('CORS blocked origin:', origin);
    callback(null, true); // Allow all origins for now to debug
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection cache
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI environment variable is not set');
      throw new Error('MONGODB_URI not set');
    }

    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Full error:', error);
    isConnected = false;
    throw error;
  }
};

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Netlify API is working',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Netlify API is working',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Debug endpoint for environment variables
app.get('/api/debug', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Debug info',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    hasMongoUri: !!process.env.MONGODB_URI,
    mongoUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'Not set',
    mongooseState: mongoose.connection.readyState,
    mongooseStates: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }
  });
});

// MongoDB health check
app.get('/api/health/db', async (req, res) => {
  try {
    await connectDB();
    res.json({
      status: 'OK',
      message: 'API and Database are working',
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

// Vehicle Schema (inline for serverless)
const vehicleSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String },
  year: { type: Number, required: true },
  licensePlate: { type: String, unique: true },
  vin: { type: String, unique: true },
  color: { type: String },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'In Service', 'Out of Service', 'Under Maintenance', 'Retired'], 
    default: 'Active' 
  },
  mileage: { type: Number, default: 0 },
  fuelType: { 
    type: String, 
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], 
    default: 'Petrol' 
  },
  purchaseDate: { type: Date },
  purchasePrice: { type: Number },
  insuranceExpiry: { type: Date },
  registrationExpiry: { type: Date },
  lastMaintenanceDate: { type: Date },
  nextMaintenanceDate: { type: Date },
  notes: { type: String },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create or get Vehicle model
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);

// Vehicle endpoints
app.get('/api/vehicles', async (req, res) => {
  try {
    console.log('Fetching vehicles - Start');
    await connectDB();
    console.log('Database connected successfully');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { licensePlate: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    console.log('Executing vehicle query:', { query, skip, limit });
    
    const vehicles = await Vehicle.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Vehicle.countDocuments(query);
    
    console.log(`Found ${vehicles.length} vehicles out of ${total} total`);
    
    res.json({
      success: true,
      data: vehicles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : 'Internal server error'
    });
  }
});

app.post('/api/vehicles', async (req, res) => {
  try {
    await connectDB();
    
    const vehicleData = req.body;
    vehicleData.updatedAt = new Date();
    
    const vehicle = new Vehicle(vehicleData);
    await vehicle.save();
    
    res.status(201).json({
      success: true,
      data: vehicle,
      message: 'Vehicle created successfully'
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Vehicle with this ${field} already exists`
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/vehicles/stats', async (req, res) => {
  try {
    await connectDB();
    
    const totalVehicles = await Vehicle.countDocuments();
    const activeVehicles = await Vehicle.countDocuments({ status: 'Active' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'Under Maintenance' });
    const outOfServiceVehicles = await Vehicle.countDocuments({ status: 'Out of Service' });
    const inactiveVehicles = await Vehicle.countDocuments({ status: 'Inactive' });
    const inServiceVehicles = await Vehicle.countDocuments({ status: 'In Service' });
    const retiredVehicles = await Vehicle.countDocuments({ status: 'Retired' });
    
    // Insurance expiry alerts (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const insuranceExpiryAlerts = await Vehicle.countDocuments({
      insuranceExpiry: { $lte: thirtyDaysFromNow, $gte: new Date() }
    });
    
    res.json({
      success: true,
      data: {
        totalVehicles,
        activeVehicles,
        maintenanceVehicles,
        outOfServiceVehicles,
        inactiveVehicles,
        inServiceVehicles,
        retiredVehicles,
        insuranceExpiryAlerts
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get('/api/vehicles/:id', async (req, res) => {
  try {
    await connectDB();
    
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.put('/api/vehicles/:id', async (req, res) => {
  try {
    await connectDB();
    
    const vehicleData = req.body;
    vehicleData.updatedAt = new Date();
    
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      vehicleData,
      { new: true, runValidators: true }
    );
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    await connectDB();
    
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Notification endpoints
app.get('/api/notifications/insurance-expiry', async (req, res) => {
  try {
    console.log('Fetching insurance expiry notifications - Start');
    await connectDB();
    console.log('Database connected successfully for notifications');
    
    const days = parseInt(req.query.days) || 30;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    console.log('Searching for vehicles with insurance expiry between:', new Date(), 'and', targetDate);
    
    const vehicles = await Vehicle.find({
      insuranceExpiry: { $lte: targetDate, $gte: new Date() }
    }).sort({ insuranceExpiry: 1 });
    
    console.log(`Found ${vehicles.length} vehicles with insurance expiring soon`);
    
    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching insurance expiry notifications:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : 'Internal server error'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'DT Vehicles Management API',
    version: '1.0.0',
    platform: 'Netlify Functions',
    endpoints: {
      health: '/api/health',
      vehicles: '/api/vehicles',
      stats: '/api/vehicles/stats',
      notifications: '/api/notifications/insurance-expiry'
    }
  });
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`
  });
});

// Export the serverless handler
const handler = serverless(app, {
  binary: false,
  request: (request, event, context) => {
    // Handle the path properly for Netlify functions
    const path = event.path;
    if (path.startsWith('/.netlify/functions/api')) {
      request.url = path.replace('/.netlify/functions/api', '');
      if (request.url === '') {
        request.url = '/';
      }
    }
    return request;
  }
});

module.exports = { handler };
