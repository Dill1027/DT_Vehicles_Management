import api from './api';

// Optimized dashboard service to fetch only necessary data
const dashboardService = {
  // Get dashboard summary data in a single API call
  getDashboardSummary: async () => {
    try {
      // Fetch only essential vehicle data with smaller payload
      const vehiclesResponse = await api.get('/api/vehicles', {
        params: {
          limit: 50, // Limit to recent vehicles
          select: 'vehicleNumber,make,model,status,insuranceExpiry,licenseExpiry,lastService,nextService,assignedDriver'
        }
      });

      // Get notification count
      const notificationsResponse = await api.get('/api/notifications/count');

      return {
        vehicles: vehiclesResponse.data.data || [],
        notificationCount: notificationsResponse.data.count || 0,
        pagination: vehiclesResponse.data.pagination || {}
      };
    } catch (error) {
      console.error('Dashboard summary fetch error:', error);
      throw error;
    }
  },

  // Get vehicle statistics
  getVehicleStats: (vehicles) => {
    const stats = {
      total: vehicles.length,
      active: 0,
      maintenance: 0,
      outOfService: 0,
      available: 0
    };

    vehicles.forEach(vehicle => {
      switch (vehicle.status?.toLowerCase()) {
        case 'active':
          stats.active++;
          break;
        case 'maintenance':
          stats.maintenance++;
          break;
        case 'out of service':
          stats.outOfService++;
          break;
        case 'available':
          stats.available++;
          break;
        default:
          // Handle unknown status
          break;
      }
    });

    return stats;
  },

  // Get alert data efficiently
  getAlerts: (vehicles) => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

    const alerts = {
      insurance: [],
      license: [],
      maintenance: []
    };

    vehicles.forEach(vehicle => {
      // Insurance expiry alerts
      if (vehicle.insuranceExpiry) {
        const expiryDate = new Date(vehicle.insuranceExpiry);
        if (expiryDate <= thirtyDaysFromNow) {
          alerts.insurance.push({
            id: vehicle._id,
            vehicleNumber: vehicle.vehicleNumber,
            make: vehicle.make,
            model: vehicle.model,
            expiryDate: vehicle.insuranceExpiry,
            daysLeft: Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
          });
        }
      }

      // License expiry alerts
      if (vehicle.licenseExpiry) {
        const expiryDate = new Date(vehicle.licenseExpiry);
        if (expiryDate <= thirtyDaysFromNow) {
          alerts.license.push({
            id: vehicle._id,
            vehicleNumber: vehicle.vehicleNumber,
            make: vehicle.make,
            model: vehicle.model,
            expiryDate: vehicle.licenseExpiry,
            daysLeft: Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
          });
        }
      }

      // Maintenance alerts
      if (vehicle.nextService) {
        const serviceDate = new Date(vehicle.nextService);
        if (serviceDate <= thirtyDaysFromNow) {
          alerts.maintenance.push({
            id: vehicle._id,
            vehicleNumber: vehicle.vehicleNumber,
            make: vehicle.make,
            model: vehicle.model,
            serviceDate: vehicle.nextService,
            daysLeft: Math.ceil((serviceDate - today) / (1000 * 60 * 60 * 24))
          });
        }
      }
    });

    return alerts;
  }
};

export default dashboardService;
