// Static-friendly vehicle service for Netlify deployment
// This file provides vehicle management functionality without requiring a backend server

import { vehicleService, maintenanceService, userService } from './staticVehicleService';

// Export all services
export { vehicleService, maintenanceService, userService };

// Export as default for backward compatibility
const services = { vehicleService, maintenanceService, userService };
export default services;
