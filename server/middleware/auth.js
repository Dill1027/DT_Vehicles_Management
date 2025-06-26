const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user inactive.'
      });
    }

    req.user = decoded;
    req.userDetails = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

/**
 * Enhanced authorization middleware - Check if user has required permission
 * @param {string|Array} permissions - Required permission(s)
 */
const authorize = (...permissions) => {
  return (req, res, next) => {
    if (!req.userDetails) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Check if user has any of the required permissions
    const hasPermission = permissions.some(permission => 
      req.userDetails.hasPermission && req.userDetails.hasPermission(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.userDetails.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

/**
 * Check if user can modify vehicles
 */
const canModifyVehicles = (req, res, next) => {
  if (!req.userDetails) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  const canModify = req.userDetails.hasPermission('vehicles.edit') || 
                   req.userDetails.hasPermission('vehicles.create') || 
                   req.userDetails.hasPermission('vehicles.delete');

  if (!canModify) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to modify vehicles'
    });
  }

  next();
};

/**
 * Check if user can view reports
 */
const canViewReports = (req, res, next) => {
  if (!req.userDetails) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  if (!req.userDetails.hasPermission('reports.view')) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view reports'
    });
  }

  next();
};

/**
 * Check if user can export reports
 */
const canExportReports = (req, res, next) => {
  if (!req.userDetails) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }

  if (!req.userDetails.hasPermission('reports.export')) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to export reports'
    });
  }

  next();
};

// Permission-based authorization
const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.userDetails) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated.'
        });
      }

      if (!req.userDetails.permissions[permission]) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Missing permission: ${permission}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check error.'
      });
    }
  };
};

// Resource ownership check (for users accessing their own resources)
const checkOwnership = (resourceField = 'userId') => {
  return async (req, res, next) => {
    try {
      if (!req.userDetails) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated.'
        });
      }

      // Admin and Manager can access any resource
      if (['Admin', 'Manager'].includes(req.userDetails.role)) {
        return next();
      }

      // Check if user is accessing their own resource
      const resourceId = req.params.id || req.body[resourceField] || req.query[resourceField];
      
      if (resourceId && resourceId.toString() !== req.user.userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({
        success: false,
        message: 'Ownership check error.'
      });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  checkPermission,
  checkOwnership,
  canModifyVehicles,
  canViewReports,
  canExportReports
};
