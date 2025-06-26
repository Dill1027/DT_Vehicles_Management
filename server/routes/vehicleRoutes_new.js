const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles'
    });
  }
});

// Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
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
      message: 'Error fetching vehicle'
    });
  }
});

// Create new vehicle
router.post('/', async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating vehicle'
    });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const updated = await Vehicle.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating vehicle'
    });
  }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Vehicle.findByIdAndDelete(req.params.id);
    if (!deleted) {
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
      message: 'Error deleting vehicle'
    });
  }
});

// Get vehicle statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await Vehicle.countDocuments();
    const typeStats = await Vehicle.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    // Count vehicles with upcoming expiries (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingInsuranceExpiry = await Vehicle.countDocuments({
      insuranceExpiry: { $lte: thirtyDaysFromNow, $gte: new Date() }
    });
    
    const upcomingEmissionExpiry = await Vehicle.countDocuments({
      emissionExpiry: { $lte: thirtyDaysFromNow, $gte: new Date() }
    });
    
    const upcomingRevenueExpiry = await Vehicle.countDocuments({
      revenueExpiry: { $lte: thirtyDaysFromNow, $gte: new Date() }
    });

    res.json({
      success: true,
      data: {
        total,
        typeStats,
        upcomingExpirations: {
          insurance: upcomingInsuranceExpiry,
          emission: upcomingEmissionExpiry,
          revenue: upcomingRevenueExpiry
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle statistics'
    });
  }
});

module.exports = router;
