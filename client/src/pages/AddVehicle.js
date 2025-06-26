import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';

const AddVehicle = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    make: '',
    model: '',
    modelMake: '',
    year: '',
    type: '',
    color: '',
    licensePlate: '',
    vin: '',
    mileage: '',
    fuelType: 'gasoline',
    status: 'available',
    insuranceDetails: '',
    insuranceExpiry: '',
    emissionExpiry: '',
    revenueExpiry: '',
    leaseDue: '',
    serviceDate: '',
    lastMaintenanceDate: '',
    nextMaintenanceDate: '',
    tyreBatteryHistory: '',
    imageUrl: '',
    notes: '',
    department: '',
    purchaseDate: '',
    purchasePrice: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    
    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    if (!formData.type.trim()) newErrors.type = 'Vehicle type is required';
    if (!formData.insuranceDetails.trim()) newErrors.insuranceDetails = 'Insurance details are required';
    
    // Either make/model OR modelMake is required
    if (!formData.modelMake.trim() && (!formData.make.trim() || !formData.model.trim())) {
      newErrors.modelMake = 'Vehicle make/model information is required';
    }
    
    if (formData.year && (isNaN(formData.year) || formData.year < 1900 || formData.year > new Date().getFullYear() + 1)) {
      newErrors.year = 'Please enter a valid year';
    }
    
    if (formData.mileage && (isNaN(formData.mileage) || formData.mileage < 0)) {
      newErrors.mileage = 'Please enter a valid mileage';
    }

    if (formData.purchasePrice && (isNaN(formData.purchasePrice) || formData.purchasePrice < 0)) {
      newErrors.purchasePrice = 'Please enter a valid purchase price';
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
      await vehicleService.createVehicle(formData);
      navigate('/vehicles');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      setErrors({ submit: 'Failed to create vehicle. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/vehicles');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Vehicle</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number *
              </label>
              <input
                type="text"
                id="vehicleNumber"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.vehicleNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter vehicle number"
              />
              {errors.vehicleNumber && <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber}</p>}
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type *
              </label>
              <input
                type="text"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter vehicle type (e.g., Car, Van, Truck)"
              />
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>

            <div>
              <label htmlFor="modelMake" className="block text-sm font-medium text-gray-700 mb-2">
                Make/Model *
              </label>
              <input
                type="text"
                id="modelMake"
                name="modelMake"
                value={formData.modelMake}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.modelMake ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter make and model (e.g., Toyota Camry)"
              />
              {errors.modelMake && <p className="mt-1 text-sm text-red-600">{errors.modelMake}</p>}
            </div>

            <div>
              <label htmlFor="insuranceDetails" className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Details *
              </label>
              <input
                type="text"
                id="insuranceDetails"
                name="insuranceDetails"
                value={formData.insuranceDetails}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.insuranceDetails ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter insurance details"
              />
              {errors.insuranceDetails && <p className="mt-1 text-sm text-red-600">{errors.insuranceDetails}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter color"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Plate *
              </label>
              <input
                type="text"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VIN *
              </label>
              <input
                type="text"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mileage
              </label>
              <input
                type="number"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuel Type
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Maintenance Date
              </label>
              <input
                type="date"
                name="lastMaintenanceDate"
                value={formData.lastMaintenanceDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Maintenance Date
              </label>
              <input
                type="date"
                name="nextMaintenanceDate"
                value={formData.nextMaintenanceDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter any additional notes"
            />
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddVehicle;
