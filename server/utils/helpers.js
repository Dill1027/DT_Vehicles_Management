const mongoose = require('mongoose');

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId, false otherwise
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Convert string to ObjectId
 * @param {string} id - The ID string to convert
 * @returns {mongoose.Types.ObjectId|null} - ObjectId or null if invalid
 */
const toObjectId = (id) => {
  if (!isValidObjectId(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

/**
 * Generate a random string
 * @param {number} length - Length of the random string
 * @returns {string} - Random string
 */
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'datetime')
 * @returns {string} - Formatted date string
 */
const formatDate = (date, format = 'short') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString();
    case 'long':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'datetime':
      return d.toLocaleString();
    default:
      return d.toLocaleDateString();
  }
};

/**
 * Calculate days between two dates
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} - Number of days
 */
const daysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if a date is overdue
 * @param {Date} date - Date to check
 * @returns {boolean} - True if overdue, false otherwise
 */
const isOverdue = (date) => {
  if (!date) return false;
  return new Date() > new Date(date);
};

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Generate vehicle display name
 * @param {Object} vehicle - Vehicle object
 * @returns {string} - Vehicle display name
 */
const getVehicleDisplayName = (vehicle) => {
  if (!vehicle) return '';
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
};

/**
 * Generate user display name
 * @param {Object} user - User object
 * @returns {string} - User display name
 */
const getUserDisplayName = (user) => {
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`;
};

/**
 * Sanitize filename for safe storage
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
const sanitizeFilename = (filename) => {
  if (!filename) return '';
  
  // Remove or replace unsafe characters
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
};

/**
 * Parse query parameters for filtering
 * @param {Object} query - Express query object
 * @returns {Object} - Parsed filter object
 */
const parseQueryFilters = (query) => {
  const filters = {};
  
  // Handle common filter fields
  if (query.status) filters.status = query.status;
  if (query.type) filters.type = query.type;
  if (query.priority) filters.priority = query.priority;
  if (query.department) filters.department = new RegExp(query.department, 'i');
  if (query.isActive !== undefined) filters.isActive = query.isActive === 'true';
  
  // Handle date ranges
  if (query.startDate || query.endDate) {
    filters.createdAt = {};
    if (query.startDate) filters.createdAt.$gte = new Date(query.startDate);
    if (query.endDate) filters.createdAt.$lte = new Date(query.endDate);
  }
  
  // Handle search across multiple fields
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filters.$or = [
      { name: searchRegex },
      { description: searchRegex },
      { notes: searchRegex }
    ];
  }
  
  return filters;
};

/**
 * Generate pagination options
 * @param {Object} query - Express query object
 * @returns {Object} - Pagination options
 */
const getPaginationOptions = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 10, 100); // Max 100 items per page
  const skip = (page - 1) * limit;
  
  return {
    page,
    limit,
    skip,
    sort: query.sort || { createdAt: -1 }
  };
};

module.exports = {
  isValidObjectId,
  toObjectId,
  generateRandomString,
  formatDate,
  daysBetween,
  isOverdue,
  capitalize,
  formatCurrency,
  getVehicleDisplayName,
  getUserDisplayName,
  sanitizeFilename,
  parseQueryFilters,
  getPaginationOptions
};
