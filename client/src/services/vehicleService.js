// Backend-connected vehicle service for MongoDB integration
// This file provides vehicle management functionality with MongoDB backend

import { vehicleService, maintenanceService, userService } from './backendVehicleService';

// Export all services
export { vehicleService, maintenanceService, userService };

// Export as default for backward compatibility
const services = { vehicleService, maintenanceService, userService };
export default services;
