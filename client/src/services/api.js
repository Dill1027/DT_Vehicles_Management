import axios from 'axios';
import { toast } from 'react-hot-toast';

// Determine if we're in development mode
const isDev = process.env.NODE_ENV === 'development';
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Set up API base URL - Connect to backend server
const API_BASE_URL = process.env.REACT_APP_API_URL || (isLocalhost
  ? 'http://localhost:5002/api'
  : 'https://dt-vehicles-backend.vercel.app/api');

// Debug logging
console.log('🔗 API Configuration:', {
  envApiUrl: process.env.REACT_APP_API_URL,
  isDev,
  isLocalhost,
  baseURL: API_BASE_URL,
  environment: process.env.NODE_ENV
});

// Create axios instance with optimized configurations
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000, // 30 second timeout for large uploads
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Add compression support
  decompress: true,
  // Enable keep-alive for better performance
  maxRedirects: 5,
  // Add connection reuse
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
});

// Track if we've already shown the server offline message
let hasShownOfflineMessage = false;
let offlineMessageTimeout = null;

// Request interceptor (no authentication required)
api.interceptors.request.use(
  (config) => {
    // No authentication headers needed
    return config;
  },
  (error) => {
    return Promise.reject(error instanceof Error ? error : new Error(error));
  }
);

// Response interceptor for enhanced error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config, code } = error;
    
    console.log('🚨 API Error Details:', {
      code,
      status: response?.status,
      message: error.message,
      url: config?.url,
      method: config?.method,
      origin: window.location.origin
    });

    if (response?.status === 401) {
      if (!config?.url?.includes('/auth/login')) window.dispatchEvent(new Event('fleet-session-expired'));
      return Promise.reject(error);
    }

    // Handle CORS errors specifically
    if (error.message.includes('CORS') || error.message.includes('Access-Control')) {
      console.error('🚫 CORS Error - Backend may not be allowing this origin');
      if (!hasShownOfflineMessage) {
        toast.error('Connection blocked - CORS policy error. Please contact support.');
        hasShownOfflineMessage = true;
      }
      return Promise.reject(new Error('CORS policy blocked this request'));
    }

    // Handle 413 Payload Too Large
    if (response?.status === 413) {
      console.error('📦 Payload too large error');
      toast.error('File too large. Please reduce size to under 10MB and try again.');
      return Promise.reject(new Error('Request payload too large'));
    }

    // Handle server connection issues
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      // Show offline message (only once)
      if (!hasShownOfflineMessage) {
        toast.error(code === 'ECONNABORTED'
          ? 'The server took too long to respond. Please try again.'
          : 'Cannot reach the API server. Check the backend connection.');
        hasShownOfflineMessage = true;
        
        // Clear any existing timeout to prevent memory leaks
        if (offlineMessageTimeout) {
          clearTimeout(offlineMessageTimeout);
        }
        
        // Reset after 30 seconds so we can show again if issues persist
        offlineMessageTimeout = setTimeout(() => {
          hasShownOfflineMessage = false;
          offlineMessageTimeout = null;
        }, 30000);
      }
    }
    
    // Server error
    if (error.response?.status >= 500) {
      toast.error(response.status === 503
        ? 'Database temporarily unavailable. Please try again shortly.'
        : 'The server could not complete the request. Please try again.');
    }
    
    return Promise.reject(error instanceof Error ? error : new Error(error.message || 'Unknown error'));
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