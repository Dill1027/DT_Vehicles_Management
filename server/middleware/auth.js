const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization header provided.'
      });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error.'
      });
    }

    let token;
    
    // Handle different token formats
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else {
      token = authHeader; // Token without Bearer prefix
    }

    // Validate token format
    if (!token || token.trim() === '') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }

    // Additional validation for token structure
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('JWT malformed - invalid token structure:', {
        tokenLength: token.length,
        parts: tokenParts.length,
        token: token.substring(0, 20) + '...' // Log first 20 chars for debugging
      });
      return res.status(401).json({
        success: false,
        message: 'Access denied. Malformed token.'
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload.'
      });
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive.'
      });
    }

    req.user = decoded;
    req.userDetails = user;
    next();
  } catch (error) {
    console.error('Authentication error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      tokenPresent: !!req.header('Authorization'),
      jwtSecretPresent: !!process.env.JWT_SECRET
    });

    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format or signature.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        message: 'Token not active yet.'
      });
    }

    res.status(401).json({
      success: false,
      message: 'Authentication failed.'
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
