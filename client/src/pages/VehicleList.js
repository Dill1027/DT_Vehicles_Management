import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import VehicleCard from '../components/VehicleCard';
import VehicleModal from '../components/VehicleModal';

const VehicleList = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterMake, setFilterMake] = useState('all');
  const [filterFuelType, setFilterFuelType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Helper functions to get unique values for filters
  const getUniqueValues = (field) => {
    const values = vehicles.map(vehicle => vehicle[field]).filter(Boolean);
    const uniqueValues = [...new Set(values)].sort();
    
    // Add common options if no data exists
    if (uniqueValues.length === 0) {
      if (field === 'type') {
        return ['Car', 'Truck', 'Van', 'Motorcycle', 'Bus'];
      } else if (field === 'fuelType') {
        return ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
      }
    }
    
    return uniqueValues;
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAllVehicles();
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      try {
        const result = await vehicleService.deleteVehicle(vehicleId);
        if (result.success) {
          // Handle both 'id' and '_id' properties for compatibility
          setVehicles(vehicles.filter(vehicle => 
            vehicle._id !== vehicleId && vehicle.id !== vehicleId
          ));
          // You can add a toast notification here if you have a notification system
          console.log('Vehicle deleted successfully');
        } else {
          throw new Error('Delete operation failed');
        }
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Failed to delete vehicle. Please try again.');
      }
    }
  };

  const handleEdit = (vehicle) => {
    navigate(`/vehicles/${vehicle._id || vehicle.id}/edit`);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedVehicle(null);
    fetchVehicles(); // Refresh the list
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterType('all');
    setFilterMake('all');
    setFilterFuelType('all');
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = (vehicle.vehicleNumber || vehicle.vehicleId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehicle.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehicle.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehicle.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehicle.fuelType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehicle.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || vehicle.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesType = filterType === 'all' || vehicle.type?.toLowerCase() === filterType.toLowerCase();
    const matchesMake = filterMake === 'all' || vehicle.make?.toLowerCase() === filterMake.toLowerCase();
    const matchesFuelType = filterFuelType === 'all' || vehicle.fuelType?.toLowerCase() === filterFuelType.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesType && matchesMake && matchesFuelType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
        <Link
          to="/vehicles/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Add New Vehicle
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by vehicle number, make, type, status, fuel type, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-wrap gap-3">
            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="In Service">In Service</option>
                <option value="Out of Service">Out of Service</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            {/* Vehicle Type Filter */}
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                id="type-filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Types</option>
                {getUniqueValues('type').map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Make Filter */}
            <div>
              <label htmlFor="make-filter" className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <select
                id="make-filter"
                value={filterMake}
                onChange={(e) => setFilterMake(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Makes</option>
                {getUniqueValues('make').map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
            </div>

            {/* Fuel Type Filter */}
            <div>
              <label htmlFor="fuel-filter" className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select
                id="fuel-filter"
                value={filterFuelType}
                onChange={(e) => setFilterFuelType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Fuel Types</option>
                {getUniqueValues('fuelType').map(fuelType => (
                  <option key={fuelType} value={fuelType}>{fuelType}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || filterStatus !== 'all' || filterType !== 'all' || filterMake !== 'all' || filterFuelType !== 'all') && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-1 h-4 w-4 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {filterStatus}
                <button
                  onClick={() => setFilterStatus('all')}
                  className="ml-1 h-4 w-4 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
            {filterType !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Type: {filterType}
                <button
                  onClick={() => setFilterType('all')}
                  className="ml-1 h-4 w-4 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            )}
            {filterMake !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Make: {filterMake}
                <button
                  onClick={() => setFilterMake('all')}
                  className="ml-1 h-4 w-4 text-yellow-600 hover:text-yellow-800"
                >
                  ×
                </button>
              </span>
            )}
            {filterFuelType !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                Fuel: {filterFuelType}
                <button
                  onClick={() => setFilterFuelType('all')}
                  className="ml-1 h-4 w-4 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Counter */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredVehicles.length}</span> of{' '}
          <span className="font-semibold">{vehicles.length}</span> vehicles
        </p>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle, index) => (
          <VehicleCard
            key={vehicle.id || vehicle._id || index}
            vehicle={vehicle}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No vehicles found matching your criteria.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <VehicleModal
          vehicle={selectedVehicle}
          onClose={handleModalClose}
          onSave={handleModalClose}
        />
      )}
    </div>
  );
};

export default VehicleList;
