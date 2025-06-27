import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 🚗 Vehicle Service
export const vehicleService = {
  getAllVehicles: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await api.get(`/vehicles${query ? `?${query}` : ''}`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 
                (error.code === 'ERR_NETWORK' ? 'Server appears to be offline' : 'Failed to fetch vehicles'),
        error
      };
    }
  },

  getVehicleById: async (id) => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  },

  createVehicle: async (vehicleData) => {
    try {
      const response = await api.post('/vehicles', vehicleData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },

  updateVehicle: async (id, vehicleData) => {
    try {
      const response = await api.put(`/vehicles/${id}`, vehicleData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  },

  deleteVehicle: async (id) => {
    try {
      const response = await api.delete(`/vehicles/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },

  triggerNotifications: async (vehicleId, type) => {
    try {
      const response = await api.post('/vehicles/notify', { vehicleId, type });
      return response.data;
    } catch (error) {
      console.error('Error triggering notifications:', error);
      throw error;
    }
  },

  getVehicleStats: async () => {
    try {
      const response = await api.get('/vehicles/stats');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 
                (error.code === 'ERR_NETWORK' ? 'Server appears to be offline' : 'Failed to fetch vehicle statistics'),
        error
      };
    }
  },

  getExpiringVehicles: async (days = 30) => {
    try {
      const response = await api.get(`/vehicles/expiring?days=${days}`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error fetching expiring vehicles:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 
                (error.code === 'ERR_NETWORK' ? 'Server appears to be offline' : 'Failed to fetch expiring vehicles'),
        error
      };
    }
  },

  getExpiredVehicles: async () => {
    try {
      const response = await api.get('/vehicles/expired');
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      console.error('Error fetching expired vehicles:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 
                (error.code === 'ERR_NETWORK' ? 'Server appears to be offline' : 'Failed to fetch expired vehicles'),
        error
      };
    }
  }
};

// 👤 User Endpoints
export const userEndpoints = {
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  uploadProfileImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', file);
      const response = await api.post('/users/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/users/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }
};

export default api;
