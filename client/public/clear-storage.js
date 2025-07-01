// Simple script to clear localStorage for testing
// You can run this in the browser console or include it in index.html

function clearVehicleData() {
  localStorage.removeItem('dt_vehicles_data');
  localStorage.removeItem('dt_maintenance_data');
  localStorage.removeItem('dt_users_data');
  console.log('✅ All vehicle management data cleared from localStorage');
  window.location.reload();
}

// Auto-run if URL contains ?clear=true
if (window.location.search.includes('clear=true')) {
  clearVehicleData();
}

// Make function available globally
window.clearVehicleData = clearVehicleData;

console.log('🧹 Storage cleaner loaded. Run clearVehicleData() to clear all data, or visit with ?clear=true');
