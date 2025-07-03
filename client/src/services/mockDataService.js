// Mock data service for static deployment
// This replaces the backend API calls with local storage operations

const STORAGE_KEYS = {
  VEHICLES: 'dt_vehicles_data',
  MAINTENANCE: 'dt_maintenance_data',
  USERS: 'dt_users_data'
};

// Initialize with empty data if none exists
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
    // Start with completely empty vehicles array
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE)) {
    // Start with completely empty maintenance array
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    // Start with completely empty users array - no default demo user
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
};

// Mock API functions
export const mockVehicleService = {
  getAllVehicles: async () => {
    initializeData();
    const vehicles = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
    return { success: true, data: vehicles };
  },

  getVehicleById: async (id) => {
    initializeData();
    const vehicles = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
    // Handle both 'id' and '_id' properties for compatibility
    const vehicle = vehicles.find(v => v.id === id || v._id === id);
    if (vehicle) {
      return { success: true, data: vehicle };
    }
    throw new Error('Vehicle not found');
  },

  createVehicle: async (vehicleData) => {
    initializeData();
    const vehicles = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
    const vehicleId = Date.now().toString();
    const newVehicle = {
      ...vehicleData,
      id: vehicleId,
      _id: vehicleId, // Add both id and _id for compatibility
      createdAt: new Date().toISOString()
    };
    vehicles.push(newVehicle);
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    return { success: true, data: newVehicle };
  },

  updateVehicle: async (id, vehicleData) => {
    console.log('MockDataService: Updating vehicle with ID:', id); // Debug log
    console.log('MockDataService: Update data:', vehicleData); // Debug log
    initializeData();
    const vehicles = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
    console.log('MockDataService: Current vehicles:', vehicles); // Debug log
    
    // Handle both 'id' and '_id' properties for compatibility
    const index = vehicles.findIndex(v => v.id === id || v._id === id);
    console.log('MockDataService: Found vehicle at index:', index); // Debug log
    
    if (index !== -1) {
      // Preserve the original ID fields and merge with updated data
      const originalVehicle = vehicles[index];
      console.log('MockDataService: Original vehicle:', originalVehicle); // Debug log
      
      vehicles[index] = { 
        ...originalVehicle, 
        ...vehicleData, 
        id: originalVehicle.id, // Preserve original id
        _id: originalVehicle._id, // Preserve original _id
        updatedAt: new Date().toISOString() 
      };
      
      console.log('MockDataService: Updated vehicle:', vehicles[index]); // Debug log
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
      return { success: true, data: vehicles[index] };
    }
    console.error('MockDataService: Vehicle not found with ID:', id); // Debug log
    throw new Error('Vehicle not found');
  },

  deleteVehicle: async (id) => {
    initializeData();
    const vehicles = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
    // Handle both 'id' and '_id' properties for compatibility
    const filteredVehicles = vehicles.filter(v => v.id !== id && v._id !== id);
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(filteredVehicles));
    return { success: true };
  },

  getVehicleStats: async () => {
    initializeData();
    const vehicles = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
    const stats = {
      total: vehicles.length,
      active: vehicles.filter(v => v.status === 'Active').length,
      inService: vehicles.filter(v => v.status === 'In Service').length,
      outOfService: vehicles.filter(v => v.status === 'Out of Service').length,
      retired: vehicles.filter(v => v.status === 'Retired').length,
      pending: vehicles.filter(v => v.status === 'Pending').length
    };
    return { success: true, data: stats };
  },

  getExpiringVehicles: async () => {
    initializeData();
    const vehicles = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiring = vehicles.filter(vehicle => {
      const insurance = new Date(vehicle.insuranceExpiry);
      const emission = new Date(vehicle.emissionExpiry);
      const revenue = new Date(vehicle.revenueExpiry);
      
      return insurance <= thirtyDaysFromNow || 
             emission <= thirtyDaysFromNow || 
             revenue <= thirtyDaysFromNow;
    });
    
    return { success: true, data: expiring };
  }
};

export const mockMaintenanceService = {
  getAllMaintenance: async () => {
    initializeData();
    const maintenance = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || '[]');
    return { success: true, data: maintenance };
  },

  createMaintenance: async (maintenanceData) => {
    initializeData();
    const maintenance = JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) || '[]');
    const newMaintenance = {
      ...maintenanceData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    maintenance.push(newMaintenance);
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(maintenance));
    return { success: true, data: newMaintenance };
  }
};

export const mockUserService = {
  getCurrentUser: async () => {
    return {
      success: true,
      data: {
        id: '1',
        firstName: 'Demo',
        lastName: 'User',
        email: 'demo@deeptec.com',
        role: 'Admin',
        department: 'Administration'
      }
    };
  }
};

// Initialize data on import
initializeData();
