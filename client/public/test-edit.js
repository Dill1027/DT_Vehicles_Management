// Test script to verify vehicle edit functionality
// Run this in browser console to test the edit fix

const testVehicleEdit = async () => {
  console.log('🧪 Testing vehicle edit functionality...');
  
  // Import the service - adjust path if needed
  const { mockVehicleService } = await import('./src/services/mockDataService.js');
  
  // Create a test vehicle
  console.log('1. Creating test vehicle...');
  const testVehicle = {
    make: 'Toyota',
    model: 'Test Vehicle',
    year: '2023',
    vehicleId: 'TEST-EDIT-001',
    licensePlate: 'EDIT-123',
    status: 'available',
    fuelType: 'gasoline',
    color: 'Red'
  };
  
  const createResult = await mockVehicleService.createVehicle(testVehicle);
  console.log('✅ Vehicle created:', createResult.data);
  
  const vehicleId = createResult.data.id;
  console.log(`📝 Created vehicle with ID: ${vehicleId}`);
  
  // Test editing the vehicle
  console.log('2. Testing vehicle edit...');
  const updatedData = {
    make: 'Honda', // Changed from Toyota
    color: 'Blue', // Changed from Red
    status: 'in-use', // Changed from available
    notes: 'Updated via test'
  };
  
  const updateResult = await mockVehicleService.updateVehicle(vehicleId, updatedData);
  console.log('✅ Update result:', updateResult);
  
  // Verify the changes
  console.log('3. Verifying changes...');
  const updatedVehicle = await mockVehicleService.getVehicleById(vehicleId);
  console.log('✅ Updated vehicle:', updatedVehicle.data);
  
  // Check if it preserved original data and updated new data
  const vehicle = updatedVehicle.data;
  console.log('4. Validation:');
  console.log(`- ID preserved: ${vehicle.id === vehicleId ? '✅' : '❌'}`);
  console.log(`- Make updated: ${vehicle.make === 'Honda' ? '✅' : '❌'}`);
  console.log(`- Color updated: ${vehicle.color === 'Blue' ? '✅' : '❌'}`);
  console.log(`- Status updated: ${vehicle.status === 'in-use' ? '✅' : '❌'}`);
  console.log(`- Original model preserved: ${vehicle.model === 'Test Vehicle' ? '✅' : '❌'}`);
  console.log(`- Original year preserved: ${vehicle.year === '2023' ? '✅' : '❌'}`);
  console.log(`- Original vehicleId preserved: ${vehicle.vehicleId === 'TEST-EDIT-001' ? '✅' : '❌'}`);
  console.log(`- Notes added: ${vehicle.notes === 'Updated via test' ? '✅' : '❌'}`);
  
  // Clean up - delete the test vehicle
  console.log('5. Cleaning up...');
  await mockVehicleService.deleteVehicle(vehicleId);
  console.log('✅ Test vehicle deleted');
  
  console.log('🎉 Edit test completed!');
};

// Export for testing
window.testVehicleEdit = testVehicleEdit;

console.log('To test vehicle editing, run: testVehicleEdit()');
