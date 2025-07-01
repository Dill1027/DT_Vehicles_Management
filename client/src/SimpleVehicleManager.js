import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Simple Vehicle Management Component (based on your boilerplate)
function SimpleVehicleManager() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/vehicles');
      setVehicles(response.data.success ? response.data.data : response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicleData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/vehicles', vehicleData);
      const newVehicle = response.data.success ? response.data.data : response.data;
      setVehicles([...vehicles, newVehicle]);
      return true;
    } catch (err) {
      console.error('Error adding vehicle:', err);
      setError('Failed to add vehicle');
      return false;
    }
  };

  const updateVehicle = async (id, vehicleData) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/vehicles/${id}`, vehicleData);
      const updatedVehicle = response.data.success ? response.data.data : response.data;
      setVehicles(vehicles.map(v => v._id === id ? updatedVehicle : v));
      return true;
    } catch (err) {
      console.error('Error updating vehicle:', err);
      setError('Failed to update vehicle');
      return false;
    }
  };

  const deleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/vehicles/${id}`);
      setVehicles(vehicles.filter(v => v._id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setError('Failed to delete vehicle');
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3">Loading vehicles...</span>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">🚗 Vehicle Management System</h1>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
      </div>

      {/* Add Vehicle Form */}
      <VehicleForm onSubmit={addVehicle} />

      {/* Vehicle List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Vehicles ({vehicles.length})
          </h2>
        </div>
        
        {vehicles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">No vehicles found</p>
            <p>Add your first vehicle using the form above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model/Make
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Insurance Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle, index) => (
                  <VehicleRow 
                    key={vehicle.id || vehicle._id || index}
                    vehicle={vehicle}
                    onUpdate={updateVehicle}
                    onDelete={deleteVehicle}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Vehicle Form Component
function VehicleForm({ onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    modelMake: '',
    type: '',
    insuranceDetails: '',
    insuranceExpiry: '',
    emissionExpiry: '',
    revenueExpiry: '',
    leaseDue: '',
    serviceDate: '',
    tyreBatteryHistory: '',
    imageUrl: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        insuranceExpiry: initialData.insuranceExpiry ? 
          new Date(initialData.insuranceExpiry).toISOString().split('T')[0] : '',
        emissionExpiry: initialData.emissionExpiry ? 
          new Date(initialData.emissionExpiry).toISOString().split('T')[0] : '',
        revenueExpiry: initialData.revenueExpiry ? 
          new Date(initialData.revenueExpiry).toISOString().split('T')[0] : '',
        leaseDue: initialData.leaseDue ? 
          new Date(initialData.leaseDue).toISOString().split('T')[0] : '',
        serviceDate: initialData.serviceDate ? 
          new Date(initialData.serviceDate).toISOString().split('T')[0] : ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const success = await onSubmit(formData);
    if (success && !initialData) {
      // Reset form if adding new vehicle
      setFormData({
        vehicleNumber: '',
        modelMake: '',
        type: '',
        insuranceDetails: '',
        insuranceExpiry: '',
        emissionExpiry: '',
        revenueExpiry: '',
        leaseDue: '',
        serviceDate: '',
        tyreBatteryHistory: '',
        imageUrl: ''
      });
    }
    
    setIsSubmitting(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? 'Edit Vehicle' : 'Add New Vehicle'}
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Number *
          </label>
          <input
            type="text"
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model/Make *
          </label>
          <input
            type="text"
            name="modelMake"
            value={formData.modelMake}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Type</option>
            <option value="Car">Car</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Bus">Bus</option>
            <option value="Motorcycle">Motorcycle</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Insurance Details *
          </label>
          <input
            type="text"
            name="insuranceDetails"
            value={formData.insuranceDetails}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Insurance Expiry
          </label>
          <input
            type="date"
            name="insuranceExpiry"
            value={formData.insuranceExpiry}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Emission Expiry
          </label>
          <input
            type="date"
            name="emissionExpiry"
            value={formData.emissionExpiry}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Revenue Expiry
          </label>
          <input
            type="date"
            name="revenueExpiry"
            value={formData.revenueExpiry}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lease Due
          </label>
          <input
            type="date"
            name="leaseDue"
            value={formData.leaseDue}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Date
          </label>
          <input
            type="date"
            name="serviceDate"
            value={formData.serviceDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tyre/Battery History
          </label>
          <textarea
            name="tyreBatteryHistory"
            value={formData.tyreBatteryHistory}
            onChange={handleChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Update Vehicle' : 'Add Vehicle')}
          </button>
        </div>
      </form>
    </div>
  );
}

// Vehicle Row Component
function VehicleRow({ vehicle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data) => {
    const success = await onUpdate(vehicle._id, data);
    if (success) {
      setIsEditing(false);
    }
    return success;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpiringSoon = (dateString) => {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow && expiryDate >= new Date();
  };

  if (isEditing) {
    return (
      <tr>
        <td colSpan="5" className="px-6 py-4">
          <VehicleForm 
            initialData={vehicle} 
            onSubmit={handleUpdate} 
          />
          <button
            onClick={() => setIsEditing(false)}
            className="mt-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {vehicle.vehicleNumber}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {vehicle.modelMake}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {vehicle.type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <span className={isExpiringSoon(vehicle.insuranceExpiry) ? 'text-red-600 font-semibold' : ''}>
          {formatDate(vehicle.insuranceExpiry)}
          {isExpiringSoon(vehicle.insuranceExpiry) && ' ⚠️'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-900"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(vehicle._id)}
          className="text-red-600 hover:text-red-900"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

export default SimpleVehicleManager;
