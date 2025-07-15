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
    images: [], // Array for multiple images
    notes: '',
    status: 'Available', // Available or In Maintenance
    fuelType: 'Petrol', // Diesel or Petrol
    monthlyMileage: '', // Monthly mileage
    lastMaintenanceDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedImages, setSelectedImages] = useState([]); // For preview purposes
  const [imageFiles, setImageFiles] = useState([]); // Actual file objects

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
        images: vehicle.images || [],
        notes: vehicle.notes || '',
        status: vehicle.status || 'Available',
        fuelType: vehicle.fuelType || 'Petrol',
        monthlyMileage: vehicle.monthlyMileage || '',
        lastMaintenanceDate: vehicle.lastMaintenanceDate ? 
          new Date(vehicle.lastMaintenanceDate).toISOString().split('T')[0] : ''
      });
      
      // Set existing images for preview
      if (vehicle.images && vehicle.images.length > 0) {
        setSelectedImages(vehicle.images.map(img => typeof img === 'string' ? img : img.url));
      } else if (vehicle.imageUrl) {
        setSelectedImages([vehicle.imageUrl]);
      }
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
    const files = Array.from(e.target.files);
    console.log('Files selected:', files.length, files.map(f => ({ name: f.name, size: f.size })));
    
    if (files.length > 3) {
      setErrors(prev => ({
        ...prev,
        images: 'Maximum 3 images allowed'
      }));
      return;
    }

    // Clear any previous image errors
    if (errors.images) {
      setErrors(prev => ({
        ...prev,
        images: ''
      }));
    }

    // Validate file sizes (10MB each)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        images: `These files are too large: ${oversizedFiles.map(f => f.name).join(', ')}. Each image must be less than 10MB`
      }));
      return;
    }

    setImageFiles(files);

    // Create preview URLs
    const newPreviews = [];
    let loadedCount = 0;
    
    if (files.length === 0) {
      setSelectedImages([]);
      setFormData(prev => ({
        ...prev,
        imageUrl: ''
      }));
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target.result);
        loadedCount++;
        
        if (loadedCount === files.length) {
          console.log('All images loaded for preview:', newPreviews.length);
          setSelectedImages(newPreviews);
          // Update primary image URL for backward compatibility
          setFormData(prev => ({
            ...prev,
            imageUrl: newPreviews[0] || ''
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove) => {
    const newSelectedImages = selectedImages.filter((_, index) => index !== indexToRemove);
    const newImageFiles = imageFiles.filter((_, index) => index !== indexToRemove);
    
    setSelectedImages(newSelectedImages);
    setImageFiles(newImageFiles);
    
    // Update primary image URL
    setFormData(prev => ({
      ...prev,
      imageUrl: newSelectedImages[0] || ''
    }));
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
      console.log('Image files:', imageFiles); // Debug log
      
      if (vehicleId) {
        // Update existing vehicle
        if (imageFiles.length > 0) {
          // Try the new route first, fallback to existing route
          try {
            const result = await vehicleService.updateVehicleWithImages(vehicleId, formData, imageFiles);
            console.log('Update with images result:', result);
          } catch (error) {
            console.log('New route not available, using fallback approach');
            // Fallback: Use the first image with existing route
            if (imageFiles.length > 0) {
              const firstImageFormData = new FormData();
              Object.keys(formData).forEach(key => {
                if (formData[key] !== undefined && formData[key] !== null) {
                  firstImageFormData.append(key, formData[key]);
                }
              });
              firstImageFormData.append('vehicleImage', imageFiles[0]);
              
              // Use the existing route with first image
              const result = await vehicleService.updateVehicle(vehicleId, formData);
              console.log('Fallback update result:', result);
            }
          }
        } else {
          const result = await vehicleService.updateVehicle(vehicleId, formData);
          console.log('Update result:', result);
        }
      } else {
        // Create new vehicle
        if (imageFiles.length > 0) {
          // Try the new route first, fallback to existing route
          try {
            const result = await vehicleService.createVehicleWithImages(formData, imageFiles);
            console.log('Create with images result:', result);
          } catch (error) {
            console.log('New route not available, using fallback approach');
            // Fallback: Use the first image with existing route
            const vehicleDataWithFirstImage = {
              ...formData,
              imageUrl: selectedImages[0] || '' // Use the first preview as base64
            };
            const result = await vehicleService.createVehicle(vehicleDataWithFirstImage);
            console.log('Fallback create result:', result);
          }
        } else {
          const result = await vehicleService.createVehicle(formData);
          console.log('Create result:', result);
        }
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

            {/* Vehicle Images - Multiple Upload */}
            <div className="mt-6">
              <label htmlFor="vehicleImages" className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Images <span className="text-xs text-gray-500">(up to 3 images, max 10MB each)</span>
                {selectedImages.length > 0 && (
                  <span className="ml-2 text-sm text-blue-600 font-medium">
                    {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="vehicleImages"
                  accept="image/*,.heic,.HEIC"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Hold Ctrl/Cmd and click to select multiple images, or drag and drop multiple files
                </div>
              </div>
              {errors.images && <p className="mt-1 text-sm text-red-600">{errors.images}</p>}
              
              {/* Image Previews */}
              {selectedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Image Previews:</p>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedImages.map((imageUrl, index) => (
                      <div key={index} className="relative">
                        <img
                          src={imageUrl}
                          alt={`Vehicle preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-500 mt-1 text-center">Image {index + 1}</p>
                      </div>
                    ))}
                  </div>
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
