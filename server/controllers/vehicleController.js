const Vehicle = require('../models/Vehicle');
const { validationResult } = require('express-validator');

// Get all vehicles with filtering and pagination
const getAllVehicles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      make,
      model,
      type,
      department,
      assignedDriver,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (make) filter.make = new RegExp(make, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    if (type) filter.type = new RegExp(type, 'i');
    if (department) filter.department = new RegExp(department, 'i');
    if (assignedDriver) filter.assignedDriver = assignedDriver;

    // Search across multiple fields
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { vehicleNumber: searchRegex },
        { make: searchRegex },
        { model: searchRegex },
        { modelMake: searchRegex },
        { type: searchRegex },
        { licensePlate: searchRegex },
        { vin: searchRegex },
        { department: searchRegex }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'assignedDriver', select: 'firstName lastName email employeeId' }
      ],
      sort: { createdAt: -1 }
    };

    const vehicles = await Vehicle.paginate(filter, options);

    res.json({
      success: true,
      data: vehicles.docs,
      pagination: {
        page: vehicles.page,
        pages: vehicles.totalPages,
        total: vehicles.totalDocs,
        limit: vehicles.limit
      }
    });
  } catch (error) {
    console.error('Get all vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicles',
      error: error.message
    });
  }
};

// Get vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('assignedDriver', 'firstName lastName email employeeId phoneNumber');

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
    console.error('Get vehicle by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle',
      error: error.message
    });
  }
};

// Create new vehicle
const createVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const vehicle = new Vehicle(req.body);
    await vehicle.save();

    // Populate the assigned driver if exists
    await vehicle.populate('assignedDriver', 'firstName lastName email employeeId');

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Create vehicle error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating vehicle',
      error: error.message
    });
  }
};

// Update vehicle
const updateVehicle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedDriver', 'firstName lastName email employeeId');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: vehicle
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating vehicle',
      error: error.message
    });
  }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
  try {
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
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vehicle',
      error: error.message
    });
  }
};

// Assign driver to vehicle
// Get vehicle statistics
const getVehicleStats = async (req, res) => {
  try {
    const stats = await Vehicle.aggregate([
      {
        $facet: {
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          departmentCounts: [
            { $group: { _id: '$department', count: { $sum: 1 } } }
          ],
          fuelTypeCounts: [
            { $group: { _id: '$fuelType', count: { $sum: 1 } } }
          ],
          totalStats: [
            {
              $group: {
                _id: null,
                totalVehicles: { $sum: 1 },
                averageMileage: { $avg: '$mileage' },
                totalValue: { $sum: '$purchasePrice' },
                averageAge: {
                  $avg: {
                    $subtract: [new Date().getFullYear(), '$year']
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get vehicle stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleStats
};
