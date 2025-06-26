import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const vehicleService = {
  // Get all vehicles
  getAllVehicles: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      const response = await api.get(`/vehicles?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  // Get vehicle by ID
  getVehicleById: async (id) => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  },

  // Create new vehicle
  createVehicle: async (vehicleData) => {
    try {
      const response = await api.post('/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },

  // Update vehicle
  updateVehicle: async (id, vehicleData) => {
    try {
      const response = await api.put(`/vehicles/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  },

  // Delete vehicle
  deleteVehicle: async (id) => {
    try {
      const response = await api.delete(`/vehicles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },

  // Get vehicle statistics
  getVehicleStats: async () => {
    try {
      const response = await api.get('/vehicles/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      throw error;
    }
  },

  // Search vehicles
  searchVehicles: async (searchParams) => {
    try {
      const response = await api.get('/vehicles/search', { params: searchParams });
      return response.data;
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  },

  // Update vehicle status
  updateVehicleStatus: async (id, status) => {
    try {
      const response = await api.patch(`/vehicles/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      throw error;
    }
  },

  // Get expiring vehicles
  getExpiringVehicles: async (days = 30) => {
    try {
      const response = await api.get(`/vehicles/expiring?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expiring vehicles:', error);
      throw error;
    }
  },

  // Get expired vehicles
  getExpiredVehicles: async () => {
    try {
      const response = await api.get('/vehicles/expired');
      return response.data;
    } catch (error) {
      console.error('Error fetching expired vehicles:', error);
      throw error;
    }
  },

  // Get expiry summary
  getExpirySummary: async () => {
    try {
      const response = await api.get('/vehicles/expiry-summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching expiry summary:', error);
      throw error;
    }
  },

  // Trigger notifications
  triggerNotifications: async (vehicleId, type) => {
    try {
      const response = await api.post('/vehicles/notify', {
        vehicleId,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Error triggering notifications:', error);
      throw error;
    }
  }
};

export default api;
