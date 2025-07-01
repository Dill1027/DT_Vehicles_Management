import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import VehicleCard from '../components/VehicleCard';
import VehicleModal from '../components/VehicleModal';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

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
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedVehicle(null);
    fetchVehicles(); // Refresh the list
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.vehicleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || vehicle.status === filterStatus;
    return matchesSearch && matchesFilter;
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
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="in-use">In Use</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
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
