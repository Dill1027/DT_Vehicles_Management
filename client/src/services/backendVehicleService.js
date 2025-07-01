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

export const maintenanceService = {
  // Get all maintenance records
  getAllMaintenance: async (params = {}) => {
    try {
      const response = await api.get('/maintenance', { params });
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      throw error;
    }
  },

  // Get maintenance by vehicle ID
  getMaintenanceByVehicleId: async (vehicleId) => {
    try {
      const response = await api.get(`/maintenance/vehicle/${vehicleId}`);
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('Error fetching vehicle maintenance:', error);
      throw error;
    }
  },

  // Create maintenance record
  createMaintenance: async (maintenanceData) => {
    try {
      const response = await api.post('/maintenance', maintenanceData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Maintenance record created successfully'
      };
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      throw error;
    }
  },

  // Update maintenance record
  updateMaintenance: async (id, maintenanceData) => {
    try {
      const response = await api.put(`/maintenance/${id}`, maintenanceData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: 'Maintenance record updated successfully'
      };
    } catch (error) {
      console.error('Error updating maintenance record:', error);
      throw error;
    }
  },

  // Delete maintenance record
  deleteMaintenance: async (id) => {
    try {
      await api.delete(`/maintenance/${id}`);
      return {
        success: true,
        message: 'Maintenance record deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
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

const services = { vehicleService, maintenanceService, userService };
export default services;
