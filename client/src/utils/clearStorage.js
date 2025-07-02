// Clear localStorage utility
// This will remove all cached vehicle data from the browser

const clearAllLocalStorage = () => {
  // Clear all DT Vehicles Management data from localStorage
  const keysToRemove = [
    'dt_vehicles_data',
    'dt_maintenance_data', 
    'notificationPreferences'
  ];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });

  console.log('✅ Local storage cleared');
};

// Auto-clear when this file is imported
clearAllLocalStorage();

// Also clear when the page loads
window.addEventListener('load', () => {
  clearAllLocalStorage();
});

export default clearAllLocalStorage;
