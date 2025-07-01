// Test script to verify vehicle deletion fix
// Run this in browser console to test the fix

const testVehicleDelete = async () => {
  console.log('🧪 Testing vehicle deletion fix...');
  
  // Import the service
  const { mockVehicleService } = await import('./src/services/mockDataService.js');
  
  // Create a test vehicle
  console.log('1. Creating test vehicle...');
  const testVehicle = {
    make: 'Toyota',
    model: 'Test Vehicle',
    year: '2023',
    vehicleId: 'TEST-001',
    licensePlate: 'TEST-123',
    status: 'available',
    fuelType: 'gasoline'
  };
  
  const createResult = await mockVehicleService.createVehicle(testVehicle);
  console.log('✅ Vehicle created:', createResult.data);
  
  const vehicleId = createResult.data.id;
  console.log(`📝 Created vehicle with ID: ${vehicleId}`);
  
  // Verify vehicle exists
  console.log('2. Verifying vehicle exists...');
  const getResult = await mockVehicleService.getVehicleById(vehicleId);
  console.log('✅ Vehicle found:', getResult.data);
  
  // Test deletion
  console.log('3. Testing deletion...');
  const deleteResult = await mockVehicleService.deleteVehicle(vehicleId);
  console.log('✅ Delete result:', deleteResult);
  
  // Verify vehicle is deleted
  console.log('4. Verifying vehicle is deleted...');
  try {
    await mockVehicleService.getVehicleById(vehicleId);
    console.log('❌ FAIL: Vehicle still exists!');
  } catch (error) {
    console.log('✅ SUCCESS: Vehicle successfully deleted!');
  }
  
  console.log('🎉 Test completed!');
};

// Export for testing
window.testVehicleDelete = testVehicleDelete;

console.log('To test vehicle deletion, run: testVehicleDelete()');
