// Complete serverless API for DT Vehicles Management
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Add simple authentication bypass
app.use((req, res, next) => {
  // Skip authentication for health checks
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }
  next();
});

// Enhanced CORS configuration
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
      'https://client-pvlx3xpbu-dill1027s-projects.vercel.app'
    ];
    
    // Allow all Vercel domains
    if (origin.includes('.vercel.app') || allowedOrigins.includes(origin)) {
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

// Add bypass for health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    bypass: true
  });
});

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

// Test endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is working',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
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
    await connectDB();
    
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
    
    const vehicles = await Vehicle.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Vehicle.countDocuments(query);
    
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
    res.status(500).json({
      success: false,
      message: error.message
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
    const activeVehicles = await Vehicle.countDocuments({ status: 'active' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'maintenance' });
    const outOfServiceVehicles = await Vehicle.countDocuments({ status: 'out-of-service' });
    
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
    await connectDB();
    
    const days = parseInt(req.query.days) || 30;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    
    const vehicles = await Vehicle.find({
      insuranceExpiry: { $lte: targetDate, $gte: new Date() }
    }).sort({ insuranceExpiry: 1 });
    
    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching insurance expiry notifications:', error);
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
