import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';

const AddVehicle = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleNumber: '', // Number plate (max 8 characters)
    type: 'Car', // Van, Lorry, Car, Bike
    make: '', // BMW, Benz, etc.
    insuranceExpiry: '', // Required field
    revenueExpiry: '', // Required field
    imageUrl: '',
    notes: '',
    status: 'Available', // Available or In Maintenance
    fuelType: 'Petrol', // Diesel or Petrol
    year: new Date().getFullYear() // Add current year as default
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    if (!formData.year) newErrors.year = 'Year is required';
    if (formData.year && (formData.year < 1900 || formData.year > new Date().getFullYear() + 1)) {
      newErrors.year = 'Please enter a valid year';
    }
    if (!formData.insuranceExpiry) newErrors.insuranceExpiry = 'Insurance expiry date is required';
    if (!formData.revenueExpiry) newErrors.revenueExpiry = 'Revenue license expiry date is required';
    
    // Validate monthly mileage if provided
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
      // Create vehicle object without manually setting IDs (MongoDB handles _id automatically)
      const vehicleData = {
        ...formData
      };

      await vehicleService.createVehicle(vehicleData);
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
                <option value="Car">Car</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
                <option value="Bus">Bus</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Pickup">Pickup</option>
                <option value="Heavy Machinery">Heavy Machinery</option>
                <option value="Other">Other</option>
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
                
                {/* Car Brands */}
                <optgroup label="Car Brands">
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
                  <option value="Suzuki">Suzuki</option>
                  <option value="Mitsubishi">Mitsubishi</option>
                  <option value="Peugeot">Peugeot</option>
                  <option value="Renault">Renault</option>
                </optgroup>

                {/* Motorcycle Brands */}
                <optgroup label="Motorcycle Brands">
                  <option value="Bajaj">Bajaj</option>
                  <option value="Hero">Hero</option>
                  <option value="TVS">TVS</option>
                  <option value="Royal Enfield">Royal Enfield</option>
                  <option value="Yamaha">Yamaha</option>
                  <option value="Kawasaki">Kawasaki</option>
                  <option value="Suzuki">Suzuki</option>
                  <option value="KTM">KTM</option>
                  <option value="Ducati">Ducati</option>
                  <option value="Harley-Davidson">Harley-Davidson</option>
                  <option value="Triumph">Triumph</option>
                  <option value="Indian">Indian</option>
                  <option value="Aprilia">Aprilia</option>
                  <option value="Benelli">Benelli</option>
                  <option value="CFMoto">CFMoto</option>
                </optgroup>

                {/* Commercial Vehicle Brands */}
                <optgroup label="Commercial Vehicle Brands">
                  <option value="Tata">Tata</option>
                  <option value="Ashok Leyland">Ashok Leyland</option>
                  <option value="Mahindra">Mahindra</option>
                  <option value="Eicher">Eicher</option>
                  <option value="Force Motors">Force Motors</option>
                  <option value="Isuzu">Isuzu</option>
                  <option value="Mercedes-Benz Commercial">Mercedes-Benz Commercial</option>
                  <option value="Volvo Trucks">Volvo Trucks</option>
                  <option value="MAN">MAN</option>
                  <option value="Scania">Scania</option>
                </optgroup>

                <option value="Other">Other</option>
              </select>
              {errors.make && <p className="mt-1 text-sm text-red-600">{errors.make}</p>}
            </div>

            {/* Year */}
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
                min="1900"
                max={new Date().getFullYear() + 1}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.year ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter vehicle year"
              />
              {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
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

            {/* Revenue License Expiry */}
            <div>
              <label htmlFor="revenueExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                Revenue License Expiry *
              </label>
              <input
                type="date"
                id="revenueExpiry"
                name="revenueExpiry"
                value={formData.revenueExpiry}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.revenueExpiry ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.revenueExpiry && <p className="mt-1 text-sm text-red-600">{errors.revenueExpiry}</p>}
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

          {/* Notes */}
          <div className="mt-6">
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
              placeholder="Enter any additional notes about the vehicle"
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
