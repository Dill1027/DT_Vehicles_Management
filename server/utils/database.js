// Database connection utilities
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Error handling utilities
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Response utilities
const sendResponse = (res, statusCode, success, message, data = null) => {
  res.status(statusCode).json({
    success,
    message,
    data
  });
};

const sendSuccess = (res, message, data = null, statusCode = 200) => {
  sendResponse(res, statusCode, true, message, data);
};

const sendError = (res, message, statusCode = 500) => {
  sendResponse(res, statusCode, false, message);
};

// Pagination utilities
const getPagination = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count, rows } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(count / limit);

  return {
    totalItems: count,
    data: rows,
    totalPages,
    currentPage
  };
};

// Validation utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Minimum 8 characters, at least one letter and one number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateVIN = (vin) => {
  // Basic VIN validation (17 characters, alphanumeric excluding I, O, Q)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  return vinRegex.test(vin);
};

// Date utilities
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

// File utilities
const uploadFileToCloud = async (file, folder = 'vehicles') => {
  // Placeholder for cloud storage implementation
  // This would integrate with services like AWS S3, Cloudinary, etc.
  return {
    url: `/uploads/${folder}/${file.filename}`,
    public_id: file.filename
  };
};

const deleteFileFromCloud = async (publicId) => {
  // Placeholder for cloud storage deletion
  console.log(`Deleting file: ${publicId}`);
};

// Search utilities
const buildSearchQuery = (searchTerm, fields) => {
  if (!searchTerm) return {};

  const searchRegex = new RegExp(searchTerm, 'i');
  const orConditions = fields.map(field => ({
    [field]: { $regex: searchRegex }
  }));

  return { $or: orConditions };
};

// Generate unique identifiers
const generateVehicleId = () => {
  const timestamp = Date.now().toString(36);
  const randomNum = Math.random().toString(36).substr(2, 9);
  return `VEH-${timestamp}${randomNum}`.toUpperCase();
};

const generateMaintenanceId = () => {
  const timestamp = Date.now().toString(36);
  const randomNum = Math.random().toString(36).substr(2, 9);
  return `MAINT-${timestamp}${randomNum}`.toUpperCase();
};

// Statistics utilities
const calculateStats = (data, groupBy) => {
  const stats = {};
  
  data.forEach(item => {
    const key = item[groupBy];
    if (stats[key]) {
      stats[key]++;
    } else {
      stats[key] = 1;
    }
  });

  return stats;
};

module.exports = {
  connectDB,
  asyncHandler,
  errorHandler,
  sendResponse,
  sendSuccess,
  sendError,
  getPagination,
  getPagingData,
  validateEmail,
  validatePassword,
  validateVIN,
  formatDate,
  addDays,
  daysBetween,
  uploadFileToCloud,
  deleteFileFromCloud,
  buildSearchQuery,
  generateVehicleId,
  generateMaintenanceId,
  calculateStats
};
