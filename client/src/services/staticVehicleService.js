// Static-friendly vehicle service for Netlify deployment
import { mockVehicleService, mockMaintenanceService, mockUserService } from './mockDataService';

// Check if we should use static data (always true for local development)
const isStaticDeployment = () => {
  // Always use static data - no backend needed
  return true;
};

// Vehicle Service - works with or without backend
export const vehicleService = {
  getAllVehicles: async (params = {}) => {
    if (isStaticDeployment()) {
      const result = await mockVehicleService.getAllVehicles();
      let vehicles = result.data || [];
      
      // Apply client-side filtering
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        vehicles = vehicles.filter(vehicle => 
          vehicle.vehicleNumber?.toLowerCase().includes(searchLower) ||
          vehicle.make?.toLowerCase().includes(searchLower) ||
          vehicle.model?.toLowerCase().includes(searchLower) ||
          vehicle.licensePlate?.toLowerCase().includes(searchLower) ||
          vehicle.department?.toLowerCase().includes(searchLower) ||
          vehicle.notes?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply status filter
      if (params.status) {
        vehicles = vehicles.filter(vehicle => 
          vehicle.status?.toLowerCase() === params.status.toLowerCase()
        );
      }
      
      // Apply type filter
      if (params.type) {
        vehicles = vehicles.filter(vehicle => 
          vehicle.type?.toLowerCase() === params.type.toLowerCase()
        );
      }
      
      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const totalVehicles = vehicles.length;
      const totalPages = Math.ceil(totalVehicles / limit);
      const paginatedVehicles = vehicles.slice(startIndex, endIndex);
      
      return { 
        success: true, 
        data: paginatedVehicles,
        total: totalVehicles,
        pages: totalPages,
        page: page,
        pagination: {
          page,
          limit,
          total: totalVehicles,
          pages: totalPages
        }
      };
    }
    
    // Original API call logic here for when backend is available
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles`);
      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.warn('Backend not available, using mock data');
      return await mockVehicleService.getAllVehicles();
    }
  },

  getVehicleById: async (id) => {
    if (isStaticDeployment()) {
      return await mockVehicleService.getVehicleById(id);
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/${id}`);
      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.warn('Backend not available, using mock data');
      return await mockVehicleService.getVehicleById(id);
    }
  },

  createVehicle: async (vehicleData) => {
    if (isStaticDeployment()) {
      return await mockVehicleService.createVehicle(vehicleData);
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData)
      });
      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.warn('Backend not available, using mock data');
      return await mockVehicleService.createVehicle(vehicleData);
    }
  },

  updateVehicle: async (id, vehicleData) => {
    if (isStaticDeployment()) {
      return await mockVehicleService.updateVehicle(id, vehicleData);
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData)
      });
      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.warn('Backend not available, using mock data');
      return await mockVehicleService.updateVehicle(id, vehicleData);
    }
  },

  deleteVehicle: async (id) => {
    if (isStaticDeployment()) {
      return await mockVehicleService.deleteVehicle(id);
    }
    
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/vehicles/${id}`, {
        method: 'DELETE'
      });
      return { success: true };
    } catch (error) {
      console.warn('Backend not available, using mock data');
      return await mockVehicleService.deleteVehicle(id);
    }
  },

  getVehicleStats: async () => {
    if (isStaticDeployment()) {
      return await mockVehicleService.getVehicleStats();
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/stats`);
      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.warn('Backend not available, using mock data');
      return await mockVehicleService.getVehicleStats();
    }
  },

  getExpiringVehicles: async () => {
    if (isStaticDeployment()) {
      return await mockVehicleService.getExpiringVehicles();
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/expiring`);
      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.warn('Backend not available, using mock data');
      return await mockVehicleService.getExpiringVehicles();
    }
  },

  getVehicleMaintenanceHistory: async (vehicleId) => {
    if (isStaticDeployment()) {
      const maintenanceResult = await mockMaintenanceService.getAllMaintenance();
      const filtered = maintenanceResult.data.filter(m => m.vehicleId === vehicleId);
      return { success: true, data: filtered };
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/vehicles/${vehicleId}/maintenance`);
      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.warn('Backend not available, using mock data');
      const maintenanceResult = await mockMaintenanceService.getAllMaintenance();
      const filtered = maintenanceResult.data.filter(m => m.vehicleId === vehicleId);
      return { success: true, data: filtered };
    }
  }
};

// Maintenance Service
export const maintenanceService = {
  getAllMaintenance: async () => {
    if (isStaticDeployment()) {
      return await mockMaintenanceService.getAllMaintenance();
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/maintenance`);
      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.warn('Backend not available, using mock data');
      return await mockMaintenanceService.getAllMaintenance();
    }
  },

  createMaintenance: async (maintenanceData) => {
    if (isStaticDeployment()) {
      return await mockMaintenanceService.createMaintenance(maintenanceData);
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenanceData)
      });
      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.warn('Backend not available, using mock data');
      return await mockMaintenanceService.createMaintenance(maintenanceData);
    }
  }
};

// User Service
export const userService = {
  getCurrentUser: async () => {
    if (isStaticDeployment()) {
      return await mockUserService.getCurrentUser();
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/profile`);
      const data = await response.json();
      return { success: true, data: data.data || data };
    } catch (error) {
      console.warn('Backend not available, using mock data');
      return await mockUserService.getCurrentUser();
    }
  }
};

// Export default for backward compatibility
const services = { vehicleService, maintenanceService, userService };
export default services;
