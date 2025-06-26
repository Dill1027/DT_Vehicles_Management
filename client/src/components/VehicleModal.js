import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/vehicleService';

const VehicleModal = ({ vehicle, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    vin: '',
    mileage: '',
    fuelType: 'gasoline',
    status: 'available',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleId: vehicle.vehicleId || '',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || '',
        color: vehicle.color || '',
        licensePlate: vehicle.licensePlate || '',
        vin: vehicle.vin || '',
        mileage: vehicle.mileage || '',
        fuelType: vehicle.fuelType || 'gasoline',
        status: vehicle.status || 'available',
        lastMaintenanceDate: vehicle.lastMaintenanceDate ? 
          new Date(vehicle.lastMaintenanceDate).toISOString().split('T')[0] : '',
        nextMaintenanceDate: vehicle.nextMaintenanceDate ? 
          new Date(vehicle.nextMaintenanceDate).toISOString().split('T')[0] : '',
        notes: vehicle.notes || ''
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.vehicleId.trim()) newErrors.vehicleId = 'Vehicle ID is required';
    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year.trim()) newErrors.year = 'Year is required';
    if (!formData.licensePlate.trim()) newErrors.licensePlate = 'License plate is required';
    if (!formData.vin.trim()) newErrors.vin = 'VIN is required';
    
    if (formData.year && (isNaN(formData.year) || formData.year < 1900 || formData.year > new Date().getFullYear() + 1)) {
      newErrors.year = 'Please enter a valid year';
    }
    
    if (formData.mileage && (isNaN(formData.mileage) || formData.mileage < 0)) {
      newErrors.mileage = 'Please enter a valid mileage';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (vehicle && vehicle._id) {
        await vehicleService.updateVehicle(vehicle._id, formData);
      } else {
        await vehicleService.createVehicle(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      setErrors({ submit: 'Failed to save vehicle. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-blue-500 rounded-md p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle ID *
                </label>
                <input
                  type="text"
                  id="vehicleId"
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vehicleId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter vehicle ID"
                />
                {errors.vehicleId && <p className="mt-1 text-sm text-red-600">{errors.vehicleId}</p>}
              </div>

              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-2">
                  Make *
                </label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.make ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter make"
                />
                {errors.make && <p className="mt-1 text-sm text-red-600">{errors.make}</p>}
              </div>

              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.model ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter model"
                />
                {errors.model && <p className="mt-1 text-sm text-red-600">{errors.model}</p>}
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter year"
                />
                {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <input
                  type="text"
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter color"
                />
              </div>

              <div>
                <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-2">
                  License Plate *
                </label>
                <input
                  type="text"
                  id="licensePlate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.licensePlate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter license plate"
                />
                {errors.licensePlate && <p className="mt-1 text-sm text-red-600">{errors.licensePlate}</p>}
              </div>

              <div>
                <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-2">
                  VIN *
                </label>
                <input
                  type="text"
                  id="vin"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vin ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter VIN"
                />
                {errors.vin && <p className="mt-1 text-sm text-red-600">{errors.vin}</p>}
              </div>

              <div>
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
                  Mileage
                </label>
                <input
                  type="number"
                  id="mileage"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.mileage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter mileage"
                />
                {errors.mileage && <p className="mt-1 text-sm text-red-600">{errors.mileage}</p>}
              </div>

              <div>
                <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-2">
                  Fuel Type
                </label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gasoline">Gasoline</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="in-use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label htmlFor="lastMaintenanceDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Maintenance Date
                </label>
                <input
                  type="date"
                  id="lastMaintenanceDate"
                  name="lastMaintenanceDate"
                  value={formData.lastMaintenanceDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="nextMaintenanceDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Next Maintenance Date
                </label>
                <input
                  type="date"
                  id="nextMaintenanceDate"
                  name="nextMaintenanceDate"
                  value={formData.nextMaintenanceDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter any additional notes"
              />
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Vehicle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleModal;
