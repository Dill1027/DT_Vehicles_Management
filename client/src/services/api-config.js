// API configuration for DT Vehicles Management
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://dt-vehicles-backend.vercel.app/api', // Backend server URL
  TIMEOUT: 30000, // Increased to 30 seconds for large file uploads
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};
