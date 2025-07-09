// API configuration for DT Vehicles Management
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5002', // Backend server URL
  TIMEOUT: 10000,
  ENVIRONMENT: process.env.NODE_ENV || 'development'
};
