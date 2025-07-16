// Optimized API configuration for DT Vehicles Management
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5002/api',
  TIMEOUT: 10000, // Reduced from 30s to 10s for faster failure detection
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  // Enhanced retry configuration
  RETRY_ATTEMPTS: 1, // Reduced from 2 for faster failure detection
  RETRY_DELAY: 500, // Reduced from 1000ms
  // Performance settings
  CACHE_DURATION: 3 * 60 * 1000, // Increased to 3 minutes cache
  STALE_TIME: 2 * 60 * 1000, // 2 minutes stale time
  // Request optimization
  REQUEST_DEBOUNCE: 300, // 300ms debounce for search requests
  PAGINATION_DEFAULT_LIMIT: 20, // Increased from 10 for fewer requests
};
