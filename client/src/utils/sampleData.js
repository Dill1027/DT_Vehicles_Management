// Sample vehicle data for testing filters
const sampleVehicles = [
  {
    id: 'sample1',
    _id: 'sample1',
    vehicleNumber: 'DT-001',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    type: 'car',
    fuelType: 'gasoline',
    status: 'active',
    licensePlate: 'ABC-123',
    department: 'Sales',
    mileage: 25000,
    notes: 'Company executive vehicle',
    insuranceExpiry: '2025-07-15', // Expires in 2 weeks (current date: 2025-07-01)
    registrationExpiry: '2025-12-31',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample2',
    _id: 'sample2',
    vehicleNumber: 'DT-002',
    make: 'Ford',
    model: 'Transit',
    year: 2021,
    type: 'van',
    fuelType: 'diesel',
    status: 'in maintenance',
    licensePlate: 'DEF-456',
    department: 'Logistics',
    mileage: 45000,
    notes: 'Delivery van - scheduled maintenance',
    insuranceExpiry: '2025-06-25', // Expired 6 days ago
    registrationExpiry: '2025-11-30',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample3',
    _id: 'sample3',
    vehicleNumber: 'DT-003',
    make: 'Mercedes',
    model: 'Sprinter',
    year: 2020,
    type: 'van',
    fuelType: 'diesel',
    status: 'available',
    licensePlate: 'GHI-789',
    department: 'Operations',
    mileage: 35000,
    notes: 'Large cargo capacity',
    insuranceExpiry: '2025-07-06', // Expires in 5 days
    registrationExpiry: '2025-10-15',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample4',
    _id: 'sample4',
    vehicleNumber: 'DT-004',
    make: 'BMW',
    model: 'X5',
    year: 2023,
    type: 'car',
    fuelType: 'gasoline',
    status: 'in-use',
    licensePlate: 'JKL-012',
    department: 'Management',
    mileage: 15000,
    notes: 'Executive vehicle for CEO',
    insuranceExpiry: '2026-03-15', // Safe - expires in 8 months
    registrationExpiry: '2025-12-31',
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample5',
    _id: 'sample5',
    vehicleNumber: 'DT-005',
    make: 'Iveco',
    model: 'Daily',
    year: 2019,
    type: 'truck',
    fuelType: 'diesel',
    status: 'inactive',
    licensePlate: 'MNO-345',
    department: 'Maintenance',
    mileage: 78000,
    notes: 'Heavy duty truck - needs repairs',
    insuranceExpiry: '2025-06-15', // Expired 16 days ago
    registrationExpiry: '2025-09-30',
    createdAt: new Date().toISOString()
  }
];

// Function to initialize sample data
export const initializeSampleData = () => {
  const existingVehicles = localStorage.getItem('dt_vehicles_data');
  if (!existingVehicles || JSON.parse(existingVehicles).length === 0) {
    localStorage.setItem('dt_vehicles_data', JSON.stringify(sampleVehicles));
    console.log('Sample vehicle data initialized');
  }
};

// Auto-initialize when this file is imported
initializeSampleData();
