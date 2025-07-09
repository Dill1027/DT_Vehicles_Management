// Public API server for DT Vehicles Management
const express = require('express');
const cors = require('cors');
const app = express();

// CORS setup - allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample data
const sampleVehicles = [
  { 
    id: 1, 
    make: 'Toyota', 
    model: 'Camry', 
    year: 2022, 
    licensePlate: 'ABC123',
    status: 'Available',
    insuranceExpiry: new Date('2026-01-01'),
    licenseExpiry: new Date('2026-02-01')
  },
  { 
    id: 2, 
    make: 'Honda', 
    model: 'Civic', 
    year: 2021, 
    licensePlate: 'XYZ789',
    status: 'In Use',
    insuranceExpiry: new Date('2025-11-15'),
    licenseExpiry: new Date('2025-12-10')
  },
  { 
    id: 3, 
    make: 'Ford', 
    model: 'F-150', 
    year: 2020, 
    licensePlate: 'DEF456',
    status: 'In Maintenance',
    insuranceExpiry: new Date('2025-09-22'),
    licenseExpiry: new Date('2025-10-05')
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'DT Vehicles Management Public API', 
    version: '1.0.0', 
    status: 'running' 
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get all vehicles
app.get('/api/vehicles', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  res.json(sampleVehicles.slice(0, limit));
});

// Get vehicle stats
app.get('/api/vehicles/stats', (req, res) => {
  res.json({
    total: sampleVehicles.length,
    available: sampleVehicles.filter(v => v.status === 'Available').length,
    inUse: sampleVehicles.filter(v => v.status === 'In Use').length,
    maintenance: sampleVehicles.filter(v => v.status === 'In Maintenance').length
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server if not in Vercel environment
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5002;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
