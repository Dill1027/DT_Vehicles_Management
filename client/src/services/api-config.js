// Optimized API configuration for DT Vehicles Management
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'https://dt-vehicles-backend.vercel.app/api',
  TIMEOUT: 30000, // 30 seconds for large file uploads
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  // Enhanced retry configuration
  RETRY_ATTEMPTS: 2, // Reduced from 3 for faster failure detection
  RETRY_DELAY: 1000,
  // Performance settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes cache
  STALE_TIME: 2 * 60 * 1000, // 2 minutes stale time
  // Request optimization
  REQUEST_DEBOUNCE: 300, // 300ms debounce for search requests
  PAGINATION_DEFAULT_LIMIT: 20, // Increased from 10 for fewer requests
};
