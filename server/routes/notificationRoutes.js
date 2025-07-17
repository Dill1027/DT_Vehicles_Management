const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Version endpoint for deployment verification
router.get('/version', (req, res) => {
  res.json({
    success: true,
    version: '2.0.1',
    timestamp: new Date().toISOString(),
    features: ['expired-vehicle-fix', 'enhanced-debugging']
  });
});

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({
      sent: true
    })
    .populate('vehicle', 'vehicleNumber make model type')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Notification.countDocuments({
      sent: true
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
});

// Get unread notifications
router.get('/unread', async (req, res) => {
  try {
    const notifications = await Notification.find({
      sent: true,
      read: false
    })
    .populate('vehicle', 'vehicleNumber make model type')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Get unread notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread notifications',
      error: error.message
    });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
});

// Get notification statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              read: '$read'
            }
          }
        }
      }
    ]);

    const typeStats = {};
    if (stats[0] && stats[0].byType) {
      stats[0].byType.forEach(item => {
        if (!typeStats[item.type]) {
          typeStats[item.type] = { total: 0, unread: 0 };
        }
        typeStats[item.type].total++;
        if (!item.read) {
          typeStats[item.type].unread++;
        }
      });
    }

    res.json({
      success: true,
      data: {
        total: stats[0]?.total || 0,
        unread: stats[0]?.unread || 0,
        byType: typeStats
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification statistics',
      error: error.message
    });
  }
});

// Get vehicles with expiring documents (insurance, emission, revenue)
router.get('/expiring', async (req, res) => {
  try {
    const Vehicle = require('../models/Vehicle');
    const days = parseInt(req.query.days) || 30;
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + days);

    const vehicles = await Vehicle.find({
      $or: [
        {
          insuranceExpiry: {
            $gte: currentDate,
            $lte: futureDate
          }
        },
        {
          emissionExpiry: {
            $gte: currentDate,
            $lte: futureDate
          }
        },
        {
          revenueExpiry: {
            $gte: currentDate,
            $lte: futureDate
          }
        }
      ]
    }).select('vehicleNumber make model insuranceExpiry emissionExpiry revenueExpiry');

    // Process vehicles to determine which documents are expiring
    const expiringVehicles = vehicles.map(vehicle => {
      const expiringDocs = [];
      const vObj = vehicle.toObject();
      
      if (vehicle.insuranceExpiry && vehicle.insuranceExpiry <= futureDate && vehicle.insuranceExpiry >= currentDate) {
        expiringDocs.push({
          type: 'insurance',
          expiryDate: vehicle.insuranceExpiry,
          daysUntilExpiry: Math.ceil((new Date(vehicle.insuranceExpiry) - currentDate) / (1000 * 60 * 60 * 24))
        });
      }
      
      if (vehicle.emissionExpiry && vehicle.emissionExpiry <= futureDate && vehicle.emissionExpiry >= currentDate) {
        expiringDocs.push({
          type: 'emission',
          expiryDate: vehicle.emissionExpiry,
          daysUntilExpiry: Math.ceil((new Date(vehicle.emissionExpiry) - currentDate) / (1000 * 60 * 60 * 24))
        });
      }
      
      if (vehicle.revenueExpiry && vehicle.revenueExpiry <= futureDate && vehicle.revenueExpiry >= currentDate) {
        expiringDocs.push({
          type: 'revenue',
          expiryDate: vehicle.revenueExpiry,
          daysUntilExpiry: Math.ceil((new Date(vehicle.revenueExpiry) - currentDate) / (1000 * 60 * 60 * 24))
        });
      }

      return {
        ...vObj,
        expiringDocuments: expiringDocs
      };
    }).filter(vehicle => vehicle.expiringDocuments.length > 0);

    res.json({
      success: true,
      data: expiringVehicles
    });
  } catch (error) {
    console.error('Get expiring documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring documents',
      error: error.message
    });
  }
});

// Get vehicles with expired documents
router.get('/expired', async (req, res) => {
  try {
    const Vehicle = require('../models/Vehicle');
    const currentDate = new Date();

    const vehicles = await Vehicle.find({
      $or: [
        { insuranceExpiry: { $lt: currentDate } },
        { emissionExpiry: { $lt: currentDate } },
        { revenueExpiry: { $lt: currentDate } }
      ]
    }).select('vehicleNumber make model insuranceExpiry emissionExpiry revenueExpiry');

    // Process vehicles to determine which documents are expired
    const expiredVehicles = vehicles.map(vehicle => {
      const expiredDocs = [];
      const vObj = vehicle.toObject();
      
      if (vehicle.insuranceExpiry && vehicle.insuranceExpiry < currentDate) {
        expiredDocs.push({
          type: 'insurance',
          expiryDate: vehicle.insuranceExpiry,
          daysOverdue: Math.ceil((currentDate - new Date(vehicle.insuranceExpiry)) / (1000 * 60 * 60 * 24))
        });
      }
      
      if (vehicle.emissionExpiry && vehicle.emissionExpiry < currentDate) {
        expiredDocs.push({
          type: 'emission',
          expiryDate: vehicle.emissionExpiry,
          daysOverdue: Math.ceil((currentDate - new Date(vehicle.emissionExpiry)) / (1000 * 60 * 60 * 24))
        });
      }
      
      if (vehicle.revenueExpiry && vehicle.revenueExpiry < currentDate) {
        expiredDocs.push({
          type: 'revenue',
          expiryDate: vehicle.revenueExpiry,
          daysOverdue: Math.ceil((currentDate - new Date(vehicle.revenueExpiry)) / (1000 * 60 * 60 * 24))
        });
      }

      return {
        ...vObj,
        expiredDocuments: expiredDocs
      };
    }).filter(vehicle => vehicle.expiredDocuments.length > 0);

    res.json({
      success: true,
      data: expiredVehicles
    });
  } catch (error) {
    console.error('Get expired documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expired documents',
      error: error.message
    });
  }
});

// Get vehicles with expiring insurance
router.get('/insurance-expiry', async (req, res) => {
  try {
    const Vehicle = require('../models/Vehicle');
    const days = parseInt(req.query.days) || 30;
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + days);

    console.log(`🔍 Insurance Expiry Query - Current: ${currentDate.toISOString()}, Future: ${futureDate.toISOString()}`);

    // Find vehicles with insurance expiry within the specified range or already expired
    const vehicles = await Vehicle.find({
      $or: [
        // Insurance expiring soon
        {
          insuranceExpiry: {
            $gte: currentDate,
            $lte: futureDate
          }
        },
        // Already expired insurance
        {
          insuranceExpiry: {
            $lt: currentDate
          }
        }
      ]
    }).select('vehicleNumber make model insuranceExpiry');

    console.log(`🔍 Found ${vehicles.length} vehicles with insurance alerts`);

    // Calculate days until expiry for each vehicle
    const alertsWithDays = vehicles.map(vehicle => {
      const daysUntilExpiry = Math.ceil((new Date(vehicle.insuranceExpiry) - currentDate) / (1000 * 60 * 60 * 24));
      const isExpired = daysUntilExpiry <= 0;
      console.log(`🔍 Vehicle ${vehicle.vehicleNumber}: ${daysUntilExpiry} days, expired: ${isExpired}`);
      
      return {
        ...vehicle.toObject(),
        daysUntilExpiry,
        isExpired
      };
    });

    res.json({
      success: true,
      data: alertsWithDays
    });
  } catch (error) {
    console.error('Get insurance expiry alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching insurance expiry alerts',
      error: error.message
    });
  }
});

// Get vehicles with expiring license
router.get('/license-expiry', async (req, res) => {
  try {
    const Vehicle = require('../models/Vehicle');
    const days = parseInt(req.query.days) || 30;
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + days);

    console.log(`🔍 License Expiry Query - Current: ${currentDate.toISOString()}, Future: ${futureDate.toISOString()}`);

    // Find vehicles with license expiry within the specified range or already expired
    const vehicles = await Vehicle.find({
      $or: [
        // Licenses expiring soon
        {
          licenseExpiry: {
            $gte: currentDate,
            $lte: futureDate
          }
        },
        // Already expired licenses
        {
          licenseExpiry: {
            $lt: currentDate
          }
        }
      ]
    }).select('vehicleNumber make model licenseExpiry');

    console.log(`🔍 Found ${vehicles.length} vehicles with license alerts`);

    // Process vehicles to calculate days until expiry or days overdue
    const licenseAlerts = vehicles.map(vehicle => {
      const vObj = vehicle.toObject();
      const expiryDate = new Date(vehicle.licenseExpiry);
      const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
      const isExpired = daysUntilExpiry <= 0;
      
      console.log(`🔍 Vehicle ${vehicle.vehicleNumber}: ${daysUntilExpiry} days, expired: ${isExpired}`);
      
      return {
        ...vObj,
        licenseExpiryDate: vehicle.licenseExpiry,
        daysUntilExpiry,
        isExpired,
        urgencyLevel: daysUntilExpiry <= 0 ? 'expired' : 
                      daysUntilExpiry <= 7 ? 'critical' : 
                      daysUntilExpiry <= 15 ? 'warning' : 'info'
      };
    });

    // Sort by urgency (expired first, then by days remaining)
    licenseAlerts.sort((a, b) => {
      if (a.isExpired && !b.isExpired) return -1;
      if (!a.isExpired && b.isExpired) return 1;
      return a.daysUntilExpiry - b.daysUntilExpiry;
    });

    res.json({
      success: true,
      data: licenseAlerts
    });
  } catch (error) {
    console.error('Get license expiry alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching license expiry alerts',
      error: error.message
    });
  }
});

module.exports = router;
