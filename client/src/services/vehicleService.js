// Backend-connected vehicle service for MongoDB integration
// This file provides vehicle management functionality with MongoDB backend

import { vehicleService, userService } from './backendVehicleService';

// Export all services
export { vehicleService, userService };

// Export as default for backward compatibility
const services = { vehicleService, userService };
export default services;
