// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Vehicle Status Options
export const VEHICLE_STATUS = {
  AVAILABLE: 'available',
  IN_USE: 'in-use',
  MAINTENANCE: 'maintenance'
};

export const VEHICLE_STATUS_OPTIONS = [
  { value: VEHICLE_STATUS.AVAILABLE, label: 'Available', color: 'green' },
  { value: VEHICLE_STATUS.IN_USE, label: 'In Use', color: 'yellow' },
  { value: VEHICLE_STATUS.MAINTENANCE, label: 'Maintenance', color: 'red' }
];

// Fuel Type Options
export const FUEL_TYPES = {
  GASOLINE: 'gasoline',
  DIESEL: 'diesel',
  ELECTRIC: 'electric',
  HYBRID: 'hybrid'
};

export const FUEL_TYPE_OPTIONS = [
  { value: FUEL_TYPES.GASOLINE, label: 'Gasoline' },
  { value: FUEL_TYPES.DIESEL, label: 'Diesel' },
  { value: FUEL_TYPES.ELECTRIC, label: 'Electric' },
  { value: FUEL_TYPES.HYBRID, label: 'Hybrid' }
];

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  ISO: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  RECENT_SEARCHES: 'recentSearches'
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  VEHICLES: '/vehicles',
  ADD_VEHICLE: '/vehicles/add',
  EDIT_VEHICLE: '/vehicles/edit/:id',
  VEHICLE_DETAIL: '/vehicles/:id',
  MAINTENANCE: '/maintenance',
  REPORTS: '/reports',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register'
};

// Validation Rules
export const VALIDATION = {
  VEHICLE_ID: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[A-Z0-9-]+$/i
  },
  VIN: {
    LENGTH: 17,
    PATTERN: /^[A-HJ-NPR-Z0-9]{17}$/
  },
  LICENSE_PLATE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 10,
    PATTERN: /^[A-Z0-9\s-]+$/i
  },
  YEAR: {
    MIN: 1900,
    MAX: new Date().getFullYear() + 2
  },
  MILEAGE: {
    MIN: 0,
    MAX: 999999999
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size is too large. Maximum size is 5MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Only images are allowed.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  VEHICLE_CREATED: 'Vehicle created successfully!',
  VEHICLE_UPDATED: 'Vehicle updated successfully!',
  VEHICLE_DELETED: 'Vehicle deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!'
};

// Theme Colors
export const COLORS = {
  PRIMARY: '#2563eb',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6'
};

// Chart Colors
export const CHART_COLORS = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

export default {
  API_BASE_URL,
  VEHICLE_STATUS,
  VEHICLE_STATUS_OPTIONS,
  FUEL_TYPES,
  FUEL_TYPE_OPTIONS,
  FILE_LIMITS,
  PAGINATION,
  DATE_FORMATS,
  STORAGE_KEYS,
  ROUTES,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  COLORS,
  CHART_COLORS
};
