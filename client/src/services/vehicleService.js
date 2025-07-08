// Vehicle service with automatic fallback to static data
import { vehicleService as backendVehicleService, userService } from './backendVehicleService';
import { vehicleService as staticVehicleService } from './staticVehicleService';

// Create a wrapper that tries backend first, then falls back to static
const createFallbackService = (backendService, staticService) => {
  const fallbackWrapper = {};
  
  // Get all methods from backend service
  const methods = Object.keys(backendService);
  
  methods.forEach(method => {
    fallbackWrapper[method] = async (...args) => {
      try {
        // Try backend first
        const result = await backendService[method](...args);
        return result;
      } catch (error) {
        console.warn(`Backend ${method} failed, falling back to static data:`, error.message);
        
        // If static service has this method, use it
        if (staticService && typeof staticService[method] === 'function') {
          return await staticService[method](...args);
        }
        
        // Otherwise, throw the original error
        throw error;
      }
    };
  });
  
  return fallbackWrapper;
};

// Create vehicle service with fallback
export const vehicleService = createFallbackService(backendVehicleService, staticVehicleService);

// Export user service (no fallback needed as it's auth-related)
export { userService };

// Export as default for backward compatibility
const services = { vehicleService, userService };
export default services;
