const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5002;

// Simple CORS setup - allow all origins during development
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ], // Allow specific origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample vehicle data
const sampleVehicles = [
  {
    id: 1,
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    licensePlate: 'ABC123',
    status: 'Available',
    insuranceExpiry: new Date('2026-01-01'),
    licenseExpiry: new Date('2026-02-01'),
    mileage: 15000
  },
  {
    id: 2,
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    licensePlate: 'XYZ789',
    status: 'In Use',
    insuranceExpiry: new Date('2025-11-15'),
    licenseExpiry: new Date('2025-12-10'),
    mileage: 22000
  },
  {
    id: 3,
    make: 'Ford',
    model: 'F-150',
    year: 2020,
    licensePlate: 'DEF456',
    status: 'In Maintenance',
    insuranceExpiry: new Date('2025-09-22'),
    licenseExpiry: new Date('2025-10-05'),
    mileage: 35000
  }
];

// Sample notifications data
const sampleNotifications = [
  {
    id: 1,
    type: 'insurance-expiry',
    vehicleId: 2,
    message: 'Honda Civic insurance expires soon',
    daysRemaining: 127,
    priority: 'medium'
  },
  {
    id: 2,
    type: 'license-expiry',
    vehicleId: 2,
    message: 'Honda Civic license expires soon',
    daysRemaining: 152,
    priority: 'medium'
  }
];

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'DT Vehicles Management API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Get all vehicles
app.get('/api/vehicles', (req, res) => {
  try {
    res.json({
      success: true,
      data: sampleVehicles,
      total: sampleVehicles.length,
      page: 1,
      pages: 1,
      limit: 10
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles',
      error: error.message
    });
  }
});

// Get vehicle by ID
app.get('/api/vehicles/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vehicle = sampleVehicles.find(v => v.id === id);
    
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
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle',
      error: error.message
    });
  }
});

// Get vehicle stats
app.get('/api/vehicles/stats', (req, res) => {
  try {
    const stats = {
      total: sampleVehicles.length,
      available: sampleVehicles.filter(v => v.status === 'Available').length,
      inUse: sampleVehicles.filter(v => v.status === 'In Use').length,
      maintenance: sampleVehicles.filter(v => v.status === 'In Maintenance').length
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
});

// Add new vehicle
app.post('/api/vehicles', (req, res) => {
  try {
    const newVehicle = {
      id: sampleVehicles.length + 1,
      ...req.body,
      status: req.body.status || 'Available'
    };
    
    sampleVehicles.push(newVehicle);
    
    res.status(201).json({
      success: true,
      data: newVehicle,
      message: 'Vehicle added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding vehicle',
      error: error.message
    });
  }
});

// Update vehicle
app.put('/api/vehicles/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vehicleIndex = sampleVehicles.findIndex(v => v.id === id);
    
    if (vehicleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    sampleVehicles[vehicleIndex] = { ...sampleVehicles[vehicleIndex], ...req.body };
    
    res.json({
      success: true,
      data: sampleVehicles[vehicleIndex],
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle',
      error: error.message
    });
  }
});

// Delete vehicle
app.delete('/api/vehicles/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const vehicleIndex = sampleVehicles.findIndex(v => v.id === id);
    
    if (vehicleIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    
    sampleVehicles.splice(vehicleIndex, 1);
    
    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle',
      error: error.message
    });
  }
});

// Notification endpoints
app.get('/api/notifications', (req, res) => {
  try {
    res.json({
      success: true,
      data: sampleNotifications,
      total: sampleNotifications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

app.get('/api/notifications/insurance-expiry', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    const expiringVehicles = sampleVehicles.filter(vehicle => {
      return new Date(vehicle.insuranceExpiry) <= cutoffDate;
    });
    
    const notifications = expiringVehicles.map(vehicle => ({
      id: vehicle.id,
      type: 'insurance-expiry',
      vehicleId: vehicle.id,
      message: `${vehicle.make} ${vehicle.model} insurance expires soon`,
      daysRemaining: Math.ceil((new Date(vehicle.insuranceExpiry) - new Date()) / (1000 * 60 * 60 * 24)),
      priority: 'high'
    }));
    
    res.json({
      success: true,
      data: notifications,
      total: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching insurance expiry notifications',
      error: error.message
    });
  }
});

app.get('/api/notifications/license-expiry', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    const expiringVehicles = sampleVehicles.filter(vehicle => {
      return new Date(vehicle.licenseExpiry) <= cutoffDate;
    });
    
    const notifications = expiringVehicles.map(vehicle => ({
      id: vehicle.id,
      type: 'license-expiry',
      vehicleId: vehicle.id,
      message: `${vehicle.make} ${vehicle.model} license expires soon`,
      daysRemaining: Math.ceil((new Date(vehicle.licenseExpiry) - new Date()) / (1000 * 60 * 60 * 24)),
      priority: 'high'
    }));
    
    res.json({
      success: true,
      data: notifications,
      total: notifications.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching license expiry notifications',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET  / (API info)');
  console.log('- GET  /health (Health check)');
  console.log('- GET  /api/vehicles (Get all vehicles)');
  console.log('- GET  /api/vehicles/:id (Get vehicle by ID)');
  console.log('- GET  /api/vehicles/stats (Get vehicle stats)');
  console.log('- POST /api/vehicles (Add new vehicle)');
  console.log('- PUT  /api/vehicles/:id (Update vehicle)');
  console.log('- DELETE /api/vehicles/:id (Delete vehicle)');
  console.log('- GET  /api/notifications (Get all notifications)');
  console.log('- GET  /api/notifications/insurance-expiry (Get insurance expiry notifications)');
  console.log('- GET  /api/notifications/license-expiry (Get license expiry notifications)');
});

module.exports = app;
