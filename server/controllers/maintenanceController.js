const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all maintenance records with filtering and pagination
const getAllMaintenance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      vehicle,
      assignedMechanic,
      startDate,
      endDate,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (vehicle) filter.vehicle = vehicle;
    if (assignedMechanic) filter.assignedMechanic = assignedMechanic;

    // Date range filter
    if (startDate || endDate) {
      filter.scheduledDate = {};
      if (startDate) filter.scheduledDate.$gte = new Date(startDate);
      if (endDate) filter.scheduledDate.$lte = new Date(endDate);
    }

    // Search across multiple fields
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { description: searchRegex },
        { category: searchRegex },
        { workOrder: searchRegex }
      ];
    }

    const maintenance = await Maintenance.find(filter)
      .populate('vehicle', 'make model year licensePlate vin')
      .populate('assignedMechanic', 'firstName lastName email employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ scheduledDate: -1 });

    const total = await Maintenance.countDocuments(filter);

    res.json({
      success: true,
      data: maintenance,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance records',
      error: error.message
    });
  }
};

// Get maintenance record by ID
const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('vehicle', 'make model year licensePlate vin mileage')
      .populate('assignedMechanic', 'firstName lastName email employeeId phoneNumber')
      .populate('approval.approvedBy', 'firstName lastName email');

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Get maintenance by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance record',
      error: error.message
    });
  }
};

// Create new maintenance record
const createMaintenance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // Verify vehicle exists
    const vehicle = await Vehicle.findById(req.body.vehicle);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Verify mechanic exists if assigned
    if (req.body.assignedMechanic) {
      const mechanic = await User.findById(req.body.assignedMechanic);
      if (!mechanic || !mechanic.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Assigned mechanic not found or inactive'
        });
      }
    }

    const maintenance = new Maintenance(req.body);
    await maintenance.save();

    // Populate the maintenance record
    await maintenance.populate([
      { path: 'vehicle', select: 'make model year licensePlate vin' },
      { path: 'assignedMechanic', select: 'firstName lastName email employeeId' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: maintenance
    });
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating maintenance record',
      error: error.message
    });
  }
};

// Update maintenance record
const updateMaintenance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    // If status is being updated to completed, set completed date
    if (req.body.status === 'Completed' && !req.body.completedDate) {
      req.body.completedDate = new Date();
    }

    // If status is being updated to in progress, set start date
    if (req.body.status === 'In Progress' && !req.body.startDate) {
      req.body.startDate = new Date();
    }

    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'vehicle', select: 'make model year licensePlate vin' },
      { path: 'assignedMechanic', select: 'firstName lastName email employeeId' }
    ]);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    // Update vehicle's last maintenance date if completed
    if (maintenance.status === 'Completed') {
      await Vehicle.findByIdAndUpdate(
        maintenance.vehicle._id,
        { 
          lastMaintenanceDate: maintenance.completedDate,
          nextMaintenanceDate: maintenance.nextServiceDate
        }
      );
    }

    res.json({
      success: true,
      message: 'Maintenance record updated successfully',
      data: maintenance
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating maintenance record',
      error: error.message
    });
  }
};

// Delete maintenance record
const deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findByIdAndDelete(req.params.id);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Maintenance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting maintenance record',
      error: error.message
    });
  }
};

// Get maintenance records for a specific vehicle
const getMaintenanceByVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const maintenance = await Maintenance.find({ vehicle: vehicleId })
      .populate('assignedMechanic', 'firstName lastName email employeeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ scheduledDate: -1 });

    const total = await Maintenance.countDocuments({ vehicle: vehicleId });

    res.json({
      success: true,
      data: maintenance,
      pagination: {
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get maintenance by vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle maintenance records',
      error: error.message
    });
  }
};

// Get overdue maintenance records
const getOverdueMaintenance = async (req, res) => {
  try {
    const overdueMaintenance = await Maintenance.find({
      scheduledDate: { $lt: new Date() },
      status: { $nin: ['Completed', 'Cancelled'] }
    })
    .populate('vehicle', 'make model year licensePlate')
    .populate('assignedMechanic', 'firstName lastName email')
    .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: overdueMaintenance,
      count: overdueMaintenance.length
    });
  } catch (error) {
    console.error('Get overdue maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching overdue maintenance records',
      error: error.message
    });
  }
};

// Get maintenance statistics
const getMaintenanceStats = async (req, res) => {
  try {
    const stats = await Maintenance.aggregate([
      {
        $facet: {
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          typeCounts: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          priorityCounts: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          costStats: [
            {
              $group: {
                _id: null,
                totalCost: { $sum: '$cost.total' },
                averageCost: { $avg: '$cost.total' },
                totalLabor: { $sum: '$cost.labor' },
                totalParts: { $sum: '$cost.parts' }
              }
            }
          ],
          overdueCounts: [
            {
              $match: {
                scheduledDate: { $lt: new Date() },
                status: { $nin: ['Completed', 'Cancelled'] }
              }
            },
            { $count: 'overdue' }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get maintenance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching maintenance statistics',
      error: error.message
    });
  }
};

// Approve maintenance request
const approveMaintenance = async (req, res) => {
  try {
    const { approvalNotes } = req.body;

    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      {
        'approval.approvedBy': req.user.userId,
        'approval.approvedDate': new Date(),
        'approval.approvalNotes': approvalNotes || ''
      },
      { new: true }
    ).populate([
      { path: 'vehicle', select: 'make model year licensePlate' },
      { path: 'assignedMechanic', select: 'firstName lastName email' },
      { path: 'approval.approvedBy', select: 'firstName lastName email' }
    ]);

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }

    res.json({
      success: true,
      message: 'Maintenance request approved successfully',
      data: maintenance
    });
  } catch (error) {
    console.error('Approve maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving maintenance request',
      error: error.message
    });
  }
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceByVehicle,
  getOverdueMaintenance,
  getMaintenanceStats,
  approveMaintenance
};
