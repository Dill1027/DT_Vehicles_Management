// Mock data service for static deployment
// This replaces the backend API calls with local storage operations

const STORAGE_KEYS = {
  VEHICLES: 'dt_vehicles_data',
  MAINTENANCE: 'dt_maintenance_data',
  USERS: 'dt_users_data'
};

// Initialize with sample data if none exists
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.VEHICLES)) {
    const sampleVehicles = [
      {
        id: '1',
        vehicleId: 'DT-001',
        make: 'Toyota',
        model: 'Hilux',
        year: 2022,
        licensePlate: 'ABC-1234',
        type: 'Pickup',
        status: 'available',
        fuelType: 'diesel',
        department: 'Construction',
        mileage: 15000,
        lastService: '2024-06-01',
        nextService: '2024-09-01',
        insuranceExpiry: '2025-03-15',
        emissionExpiry: '2025-05-20',
        revenueExpiry: '2025-01-30',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        vehicleId: 'DT-002',
        make: 'Nissan',
        model: 'NV200',
        year: 2021,
        licensePlate: 'XYZ-5678',
        type: 'Van',
        status: 'in-use',
        fuelType: 'gasoline',
        department: 'Delivery',
        mileage: 25000,
        lastService: '2024-05-15',
        nextService: '2024-08-15',
        insuranceExpiry: '2025-02-10',
        emissionExpiry: '2025-04-25',
        revenueExpiry: '2025-12-15',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        vehicleId: 'DT-003',
        make: 'Ford',
        model: 'Transit',
        year: 2020,
        licensePlate: 'DEF-9012',
        type: 'Van',
        status: 'maintenance',
        fuelType: 'diesel',
        department: 'Transport',
        mileage: 45000,
        lastService: '2024-04-20',
        nextService: '2024-07-20',
        insuranceExpiry: '2024-12-05',
        emissionExpiry: '2025-01-15',
        revenueExpiry: '2024-11-30',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(sampleVehicles));
  }

  if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE)) {
    const sampleMaintenance = [
      {
        id: '1',
        vehicleId: '1',
        type: 'Scheduled',
        category: 'Oil Change',
        description: 'Regular oil change and filter replacement',
        status: 'completed',
        priority: 'medium',
        scheduledDate: '2024-06-01',
        completedDate: '2024-06-01',
        cost: { labor: 50, parts: 75, other: 0, total: 125 },
        mileageAtService: 15000,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        vehicleId: '2',
        type: 'Repair',
        category: 'Brakes',
        description: 'Brake pad replacement',
        status: 'pending',
        priority: 'high',
        scheduledDate: '2024-07-15',
        cost: { labor: 100, parts: 150, other: 0, total: 250 },
        mileageAtService: 25000,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(sampleMaintenance));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const sampleUsers = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Admin',
        email: 'admin@deeptec.com',
        role: 'Admin',
        department: 'Administration',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(sampleUsers));
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
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) {
      return { success: true, data: vehicle };
    }
    throw new Error('Vehicle not found');
  },

  createVehicle: async (vehicleData) => {
    initializeData();
    const vehicles = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
    const newVehicle = {
      ...vehicleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    vehicles.push(newVehicle);
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    return { success: true, data: newVehicle };
  },

  updateVehicle: async (id, vehicleData) => {
    initializeData();
    const vehicles = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
    const index = vehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      vehicles[index] = { ...vehicles[index], ...vehicleData, updatedAt: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
      return { success: true, data: vehicles[index] };
    }
    throw new Error('Vehicle not found');
  },

  deleteVehicle: async (id) => {
    initializeData();
    const vehicles = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
    const filteredVehicles = vehicles.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(filteredVehicles));
    return { success: true };
  },

  getVehicleStats: async () => {
    initializeData();
    const vehicles = JSON.parse(localStorage.getItem(STORAGE_KEYS.VEHICLES) || '[]');
    const stats = {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'available').length,
      inUse: vehicles.filter(v => v.status === 'in-use').length,
      maintenance: vehicles.filter(v => v.status === 'maintenance').length
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
