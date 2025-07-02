const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// Get all vehicles (no authentication required)
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

// Get vehicle statistics (move this before /:id route)
router.get('/stats', async (req, res) => {
  try {
    const total = await Vehicle.countDocuments();
    const statusStats = await Vehicle.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
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

    // Calculate status counts
    const available = statusStats.find(s => s._id === 'available')?.count || 0;
    const inUse = statusStats.find(s => s._id === 'in-use')?.count || 0;
    const maintenance = statusStats.find(s => s._id === 'maintenance')?.count || 0;

    res.json({
      success: true,
      data: {
        total,
        available,
        inUse,
        maintenance,
        statusStats,
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

// Add missing expiring vehicles endpoint
router.get('/expiring', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const vehicles = await Vehicle.getExpiringVehicles(days);
    
    const vehiclesWithAlerts = vehicles.map(vehicle => ({
      ...vehicle.toObject(),
      alerts: vehicle.getExpiryAlerts(),
      nearestExpiryDays: Math.min(
        ...vehicle.getExpiryAlerts().map(alert => alert.daysUntilExpiry)
      ),
      expiringDocuments: vehicle.getExpiryAlerts().filter(alert => alert.daysUntilExpiry > 0)
    }));

    res.json({
      success: true,
      data: vehiclesWithAlerts,
      count: vehiclesWithAlerts.length,
      message: `Found ${vehiclesWithAlerts.length} vehicles with documents expiring in ${days} days`
    });
  } catch (error) {
    console.error('Error fetching expiring vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring vehicles'
    });
  }
});

// Add missing expired vehicles endpoint
router.get('/expired', async (req, res) => {
  try {
    const vehicles = await Vehicle.getExpiredVehicles();
    
    const vehiclesWithAlerts = vehicles.map(vehicle => ({
      ...vehicle.toObject(),
      alerts: vehicle.getExpiryAlerts().filter(alert => alert.priority === 'expired'),
      expiredDocuments: vehicle.getExpiryAlerts().filter(alert => alert.priority === 'expired')
    }));

    res.json({
      success: true,
      data: vehiclesWithAlerts,
      count: vehiclesWithAlerts.length,
      message: `Found ${vehiclesWithAlerts.length} vehicles with expired documents`
    });
  } catch (error) {
    console.error('Error fetching expired vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expired vehicles'
    });
  }
});

// Get vehicle by ID (no authentication required)
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

// Create new vehicle (no authentication required)
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

// Update vehicle (no authentication required)
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

// Delete vehicle (no authentication required)
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

// Manual trigger for notification check (for testing)
router.post('/notifications/trigger', async (req, res) => {
  try {
    const { days = 30 } = req.body;
    const notificationService = require('../services/notificationService');
    
    const result = await notificationService.triggerManualNotificationCheck(days);
    
    res.json({
      success: true,
      data: result,
      message: `Notification check completed for ${days} days ahead`
    });
  } catch (error) {
    console.error('Error triggering notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error triggering notifications'
    });
  }
});

// Send weekly summary report manually
router.post('/reports/weekly', async (req, res) => {
  try {
    const notificationService = require('../services/notificationService');
    const result = await notificationService.sendWeeklySummaryReport();
    
    res.json({
      success: true,
      data: result,
      message: 'Weekly summary report sent successfully'
    });
  } catch (error) {
    console.error('Error sending weekly report:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending weekly report'
    });
  }
});

// Send monthly summary report manually
router.post('/reports/monthly', async (req, res) => {
  try {
    const notificationService = require('../services/notificationService');
    const result = await notificationService.sendMonthlySummaryReport();
    
    res.json({
      success: true,
      data: result,
      message: 'Monthly summary report sent successfully'
    });
  } catch (error) {
    console.error('Error sending monthly report:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending monthly report'
    });
  }
});

// Generate PDF reports (no authentication required)
router.get('/reports/pdf/summary', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    const PDFReportGenerator = require('../utils/pdfGenerator');
    const generator = new PDFReportGenerator();
    
    const pdfBuffer = await generator.generateVehicleSummaryReport(vehicles);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="vehicle-summary-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating vehicle summary PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report'
    });
  }
});

router.get('/reports/pdf/expiry-alerts', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const vehicles = await Vehicle.getExpiringVehicles(days);
    const PDFReportGenerator = require('../utils/pdfGenerator');
    const generator = new PDFReportGenerator();
    
    const pdfBuffer = await generator.generateExpiryAlertsReport(vehicles);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="expiry-alerts-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating expiry alerts PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report'
    });
  }
});

router.get('/reports/pdf/maintenance', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    const PDFReportGenerator = require('../utils/pdfGenerator');
    const generator = new PDFReportGenerator();
    
    const pdfBuffer = await generator.generateMaintenanceReport(vehicles);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="maintenance-report-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating maintenance PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report'
    });
  }
});

module.exports = router;
