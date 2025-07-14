// Vehicle service - backend only (deployment cleanup: static service removed)
import { vehicleService as backendVehicleService, userService } from './backendVehicleService';

// Direct export of backend vehicle service 
export const vehicleService = backendVehicleService;

// Export user service (no fallback needed as it's auth-related)
export { userService };

// Export as default for backward compatibility
const services = { vehicleService, userService };
export default services;
