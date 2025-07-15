// Backend-connected vehicle service for MongoDB integration
import api from './api';

export const vehicleService = {
  // Get all vehicles with optional filtering and pagination
  getAllVehicles: async (params = {}) => {
    try {
      const response = await api.get('/vehicles', { params });
      return {
        success: true,
        data: response.data.data || response.data,
        total: response.data.total || response.data.length,
        page: response.data.page || 1,
        pages: response.data.pages || 1
      };
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  },

  // Get vehicle by ID
  getVehicleById: async (id) => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  },

  // Create new vehicle
  createVehicle: async (vehicleData) => {
    try {
      const response = await api.post('/vehicles', vehicleData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Vehicle created successfully'
      };
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },

  // Update vehicle
  updateVehicle: async (id, vehicleData) => {
    try {
      const response = await api.put(`/vehicles/${id}`, vehicleData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Vehicle updated successfully'
      };
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  },

  // Delete vehicle
  deleteVehicle: async (id) => {
    try {
      await api.delete(`/vehicles/${id}`);
      return {
        success: true,
        message: 'Vehicle deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },

  // Create vehicle with multiple images
  createVehicleWithImages: async (vehicleData, imageFiles) => {
    try {
      const formData = new FormData();
      
      // Add vehicle data
      Object.keys(vehicleData).forEach(key => {
        if (vehicleData[key] !== undefined && vehicleData[key] !== null) {
          formData.append(key, vehicleData[key]);
        }
      });
      
      // Add image files
      imageFiles.forEach((file) => {
        formData.append('vehicleImages', file);
      });

      const response = await api.post('/vehicles/with-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Vehicle created successfully with images'
      };
    } catch (error) {
      console.error('Error creating vehicle with images:', error);
      throw error;
    }
  },

  // Update vehicle with multiple images
  updateVehicleWithImages: async (id, vehicleData, imageFiles, replaceImages = false) => {
    try {
      const formData = new FormData();
      
      // Add vehicle data
      Object.keys(vehicleData).forEach(key => {
        if (vehicleData[key] !== undefined && vehicleData[key] !== null) {
          formData.append(key, vehicleData[key]);
        }
      });
      
      // Add replace images flag
      formData.append('replaceImages', replaceImages.toString());
      
      // Add image files
      imageFiles.forEach((file) => {
        formData.append('vehicleImages', file);
      });

      const response = await api.put(`/vehicles/${id}/with-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Vehicle updated successfully with images'
      };
    } catch (error) {
      console.error('Error updating vehicle with images:', error);
      throw error;
    }
  },

  // Get vehicle statistics
  getVehicleStats: async () => {
    try {
      const response = await api.get('/vehicles/stats');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching vehicle stats:', error);
      // Return default stats if backend is not available
      return {
        success: true,
        data: {
          total: 0,
          available: 0,
          inUse: 0,
          maintenance: 0
        }
      };
    }
  },

  // Search vehicles
  searchVehicles: async (query, filters = {}) => {
    try {
      const params = { search: query, ...filters };
      const response = await api.get('/vehicles/search', { params });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error searching vehicles:', error);
      throw error;
    }
  },

  // Upload vehicle image
  uploadVehicleImage: async (vehicleId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post(`/vehicles/${vehicleId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Image uploaded successfully'
      };
    } catch (error) {
      console.error('Error uploading vehicle image:', error);
      throw error;
    }
  }
};


export const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'User updated successfully'
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

const services = { vehicleService, userService };
export default services;
