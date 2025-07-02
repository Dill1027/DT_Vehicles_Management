import axios from 'axios';
import { toast } from 'react-hot-toast';

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Set up API base URL with fallback options for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with configurations
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we've already shown the server offline message
let hasShownOfflineMessage = false;

// For development - ability to switch ports if one fails
const tryAlternatePort = async (config) => {
  if (!isDev) return null;
  
  // If original URL was using port 5001, try 5000 instead and vice versa
  const currentPort = config.baseURL.includes('5001') ? '5001' : '5000';
  const alternatePort = currentPort === '5001' ? '5000' : '5001';
  
  try {
    const newUrl = config.baseURL.replace(currentPort, alternatePort);
    const response = await axios({
      ...config,
      baseURL: newUrl
    });
    
    // If successful, update the default baseURL for future requests
    api.defaults.baseURL = newUrl;
    console.log(`✅ Connected successfully using port ${alternatePort}`);
    return response;
  } catch (error) {
    console.error(`Failed on alternate port ${alternatePort} as well:`, error.message);
    return null;
  }
};

// Request interceptor (no authentication required)
api.interceptors.request.use(
  (config) => {
    // No authentication headers needed
    return config;
  },
  (error) => {
    return Promise.reject(new Error(error));
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle server connection issues
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      if (isDev) {
        // In development, try the alternate port
        const alternateResponse = await tryAlternatePort(error.config);
        if (alternateResponse) {
          return alternateResponse;
        }
      }
      
      // Show offline message (only once)
      if (!hasShownOfflineMessage) {
        toast.error('Server appears to be offline. Please check your connection.');
        hasShownOfflineMessage = true;
        
        // Reset after 30 seconds so we can show again if issues persist
        setTimeout(() => {
          hasShownOfflineMessage = false;
        }, 30000);
      }
    }
    
    // Handle authentication issues
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        toast.error('Your session has expired. Please log in again.');
        window.location.href = '/login';
      }
    }
    
    // Server error
    if (error.response?.status >= 500) {
      toast.error('Server error. Our team has been notified.');
    }
    
    return Promise.reject(error);
  }
);

// Health check function
api.checkHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 3000 });
    return {
      online: true,
      data: response.data
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      online: false,
      error: error.message
    };
  }
};

export default api;