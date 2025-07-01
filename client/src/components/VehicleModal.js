import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { vehicleService } from '../services/vehicleService';

const VehicleModal = ({ vehicle, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    vehicleNumber: '', // Number plate (max 8 characters)
    type: '', // Van, Lorry, Car, Bike
    make: '', // BMW, Benz, etc.
    insuranceDate: '',
    insuranceExpiry: '',
    imageUrl: '',
    notes: '',
    status: 'Available', // Available or In Maintenance
    fuelType: 'Petrol', // Diesel or Petrol
    monthlyMileage: '', // Monthly mileage
    lastMaintenanceDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleNumber: vehicle.vehicleNumber || vehicle.vehicleId || '',
        type: vehicle.type || '',
        make: vehicle.make || '',
        insuranceDate: vehicle.insuranceDate ? 
          new Date(vehicle.insuranceDate).toISOString().split('T')[0] : '',
        insuranceExpiry: vehicle.insuranceExpiry ? 
          new Date(vehicle.insuranceExpiry).toISOString().split('T')[0] : '',
        imageUrl: vehicle.imageUrl || '',
        notes: vehicle.notes || '',
        status: vehicle.status || 'Available',
        fuelType: vehicle.fuelType || 'Petrol',
        monthlyMileage: vehicle.monthlyMileage || '',
        lastMaintenanceDate: vehicle.lastMaintenanceDate ? 
          new Date(vehicle.lastMaintenanceDate).toISOString().split('T')[0] : ''
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate number plate length
    if (name === 'vehicleNumber' && value.length > 8) {
      return; // Don't update if exceeds 8 characters
    }
    
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          imageUrl: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number plate is required';
    if (formData.vehicleNumber.length > 8) newErrors.vehicleNumber = 'Vehicle number plate cannot exceed 8 characters';
    if (!formData.type.trim()) newErrors.type = 'Vehicle type is required';
    if (!formData.make.trim()) newErrors.make = 'Vehicle make is required';
    if (!formData.insuranceDate) newErrors.insuranceDate = 'Insurance date is required';
    if (!formData.insuranceExpiry) newErrors.insuranceExpiry = 'Insurance expiry date is required';
    
    // Validate insurance dates
    if (formData.insuranceDate && formData.insuranceExpiry) {
      const startDate = new Date(formData.insuranceDate);
      const endDate = new Date(formData.insuranceExpiry);
      if (endDate <= startDate) {
        newErrors.insuranceExpiry = 'Insurance expiry date must be after insurance start date';
      }
    }
    
    // Validate monthly mileage if provided
    if (formData.monthlyMileage && (isNaN(formData.monthlyMileage) || formData.monthlyMileage < 0)) {
      newErrors.monthlyMileage = 'Please enter a valid monthly mileage';
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
      // Check for both _id and id properties for compatibility
      const vehicleId = vehicle && (vehicle._id || vehicle.id);
      console.log('Vehicle being saved:', vehicle); // Debug log
      console.log('Vehicle ID for update:', vehicleId); // Debug log
      console.log('Form data:', formData); // Debug log
      
      if (vehicleId) {
        // Update existing vehicle
        console.log('Updating existing vehicle with ID:', vehicleId); // Debug log
        const result = await vehicleService.updateVehicle(vehicleId, formData);
        console.log('Update result:', result); // Debug log
      } else {
        // Create new vehicle
        console.log('Creating new vehicle'); // Debug log
        const result = await vehicleService.createVehicle(formData);
        console.log('Create result:', result); // Debug log
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
              {/* Vehicle Number Plate */}
              <div>
                <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Number Plate * <span className="text-xs text-gray-500">(max 8 characters)</span>
                </label>
                <input
                  type="text"
                  id="vehicleNumber"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  maxLength="8"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.vehicleNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="ABC-1234"
                />
                <div className="flex justify-between mt-1">
                  {errors.vehicleNumber && <p className="text-sm text-red-600">{errors.vehicleNumber}</p>}
                  <p className="text-xs text-gray-500 ml-auto">{formData.vehicleNumber.length}/8</p>
                </div>
              </div>

              {/* Vehicle Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select vehicle type</option>
                  <option value="Van">Van</option>
                  <option value="Lorry">Lorry</option>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Truck">Truck</option>
                  <option value="Bus">Bus</option>
                </select>
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
              </div>

              {/* Vehicle Make */}
              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Make *
                </label>
                <select
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.make ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select vehicle make</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Toyota">Toyota</option>
                  <option value="Ford">Ford</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Honda">Honda</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Audi">Audi</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Kia">Kia</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Subaru">Subaru</option>
                  <option value="Volvo">Volvo</option>
                  <option value="Other">Other</option>
                </select>
                {errors.make && <p className="mt-1 text-sm text-red-600">{errors.make}</p>}
              </div>

              {/* Fuel Type */}
              <div>
                <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-2">
                  Fuel Type *
                </label>
                <select
                  id="fuelType"
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                </select>
              </div>

              {/* Insurance Date */}
              <div>
                <label htmlFor="insuranceDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Date *
                </label>
                <input
                  type="date"
                  id="insuranceDate"
                  name="insuranceDate"
                  value={formData.insuranceDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.insuranceDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.insuranceDate && <p className="mt-1 text-sm text-red-600">{errors.insuranceDate}</p>}
              </div>

              {/* Insurance Expiry */}
              <div>
                <label htmlFor="insuranceExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Expiry *
                </label>
                <input
                  type="date"
                  id="insuranceExpiry"
                  name="insuranceExpiry"
                  value={formData.insuranceExpiry}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.insuranceExpiry ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.insuranceExpiry && <p className="mt-1 text-sm text-red-600">{errors.insuranceExpiry}</p>}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Available">Available</option>
                  <option value="In Maintenance">In Maintenance</option>
                </select>
              </div>

              {/* Monthly Mileage */}
              <div>
                <label htmlFor="monthlyMileage" className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Mileage (km)
                </label>
                <input
                  type="number"
                  id="monthlyMileage"
                  name="monthlyMileage"
                  value={formData.monthlyMileage}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.monthlyMileage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter monthly mileage"
                />
                {errors.monthlyMileage && <p className="mt-1 text-sm text-red-600">{errors.monthlyMileage}</p>}
              </div>

              {/* Last Maintenance Date */}
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
            </div>

            {/* Vehicle Image */}
            <div className="mt-6">
              <label htmlFor="vehicleImage" className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Image
              </label>
              <input
                type="file"
                id="vehicleImage"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {formData.imageUrl && (
                <div className="mt-4">
                  <img
                    src={formData.imageUrl}
                    alt="Vehicle preview"
                    className="w-32 h-32 object-cover rounded-md border border-gray-300"
                  />
                </div>
              )}
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

VehicleModal.propTypes = {
  vehicle: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    vehicleNumber: PropTypes.string,
    vehicleId: PropTypes.string,
    type: PropTypes.string,
    make: PropTypes.string,
    insuranceDate: PropTypes.string,
    insuranceExpiry: PropTypes.string,
    imageUrl: PropTypes.string,
    notes: PropTypes.string,
    status: PropTypes.string,
    fuelType: PropTypes.string,
    monthlyMileage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lastMaintenanceDate: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default VehicleModal;
