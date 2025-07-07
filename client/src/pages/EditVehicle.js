import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EditVehicle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [originalData, setOriginalData] = useState(null);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    type: '',
    make: '',
    year: '',
    insuranceExpiry: '',
    licenseExpiry: '',
    fuelType: 'Petrol',
    monthStartMileage: '',
    monthEndMileage: '',
    status: 'Active',
    condition: 'Good',
    vehicleImages: [],
    imageUrls: [],
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await vehicleService.getVehicleById(id);
        const vehicle = response.data;
        
        // Format dates for input fields
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        const initialFormData = {
          vehicleNumber: vehicle.vehicleNumber || '',
          type: vehicle.type || '',
          make: vehicle.make || '',
          year: vehicle.year || '',
          insuranceExpiry: formatDateForInput(vehicle.insuranceExpiry),
          licenseExpiry: formatDateForInput(vehicle.licenseExpiry),
          fuelType: vehicle.fuelType || 'Petrol',
          monthStartMileage: vehicle.monthStartMileage || '',
          monthEndMileage: vehicle.monthEndMileage || '',
          status: vehicle.status || 'Active',
          condition: vehicle.condition || 'Good',
          vehicleImages: [],
          imageUrls: vehicle.vehicleImages || [],
          notes: vehicle.notes || ''
        };

        setFormData(initialFormData);
        // Store original data for reset functionality
        setOriginalData(initialFormData);
      } catch (error) {
        console.error('Error fetching vehicle details:', error);
        toast.error('Failed to fetch vehicle details');
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);

  // Check if form has been modified
  const isFormModified = useCallback(() => {
    if (!originalData) return false;
    
    // Compare current form data with original data
    const currentData = { ...formData };
    delete currentData.vehicleImages; // Exclude file objects from comparison
    
    const originalCompare = { ...originalData };
    delete originalCompare.vehicleImages; // Exclude file objects from comparison
    
    return JSON.stringify(currentData) !== JSON.stringify(originalCompare);
  }, [formData, originalData]);

  // Warn user before leaving page if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isFormModified()) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handlePopState = (e) => {
      if (isFormModified()) {
        const confirmed = window.confirm(
          'You have unsaved changes. Are you sure you want to leave without saving?'
        );
        if (!confirmed) {
          window.history.pushState(null, '', window.location.pathname);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [formData, originalData, isFormModified]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-convert vehicle number to uppercase
    const processedValue = name === 'vehicleNumber' ? value.toUpperCase() : value;
    
    // Validate vehicle number length
    if (name === 'vehicleNumber' && processedValue.length > 8) {
      return; // Don't update if exceeds 8 characters
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Helper function to read file
  const readFileAsDataURL = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 3 images
    if (files.length > 3) {
      toast.error('You can upload maximum 3 images');
      return;
    }

    // Check if adding new images would exceed limit
    if (formData.imageUrls.length + files.length > 3) {
      toast.error(`You can only upload ${3 - formData.imageUrls.length} more image(s)`);
      return;
    }

    // Process files
    const newImages = [];
    const newImageUrls = [];

    for (const file of files) {
      if (file) {
        const url = await readFileAsDataURL(file);
        newImages.push(file);
        newImageUrls.push(url);
      }
    }

    setFormData(prev => ({
      ...prev,
      vehicleImages: [...prev.vehicleImages, ...newImages],
      imageUrls: [...prev.imageUrls, ...newImageUrls]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      vehicleImages: prev.vehicleImages.filter((_, i) => i !== index),
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    if (formData.vehicleNumber.length > 8) newErrors.vehicleNumber = 'Vehicle number cannot exceed 8 characters';
    if (!formData.type.trim()) newErrors.type = 'Vehicle type is required';
    if (!formData.make.trim()) newErrors.make = 'Vehicle make is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (formData.year && (formData.year < 1900 || formData.year > new Date().getFullYear() + 1)) {
      newErrors.year = 'Please enter a valid year';
    }
    
    // Insurance and License dates are NOT required for editing - they can be removed
    // This allows users to clear existing dates if needed
    
    // Validate monthly mileage (both fields are optional)
    if (formData.monthStartMileage && (isNaN(formData.monthStartMileage) || formData.monthStartMileage < 0)) {
      newErrors.monthStartMileage = 'Please enter a valid start mileage';
    }
    
    if (formData.monthEndMileage && (isNaN(formData.monthEndMileage) || formData.monthEndMileage < 0)) {
      newErrors.monthEndMileage = 'Please enter a valid end mileage';
    }
    
    if (formData.monthStartMileage && formData.monthEndMileage && 
        parseFloat(formData.monthEndMileage) < parseFloat(formData.monthStartMileage)) {
      newErrors.monthEndMileage = 'End mileage must be greater than start mileage';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Create vehicle object - remove any extra frontend-only fields
      const {
        vehicleImages,
        imageUrls,
        ...cleanFormData
      } = formData;
      
      const vehicleData = {
        ...cleanFormData,
        year: formData.year ? parseInt(formData.year) : null,
        monthStartMileage: formData.monthStartMileage ? parseFloat(formData.monthStartMileage) : 0,
        monthEndMileage: formData.monthEndMileage ? parseFloat(formData.monthEndMileage) : 0,
        vehicleImages: formData.imageUrls || [],
        monthlyMileage: formData.monthEndMileage && formData.monthStartMileage 
          ? parseFloat(formData.monthEndMileage) - parseFloat(formData.monthStartMileage) 
          : 0,
        // Allow empty dates for insurance and license
        insuranceExpiry: formData.insuranceExpiry || null,
        licenseExpiry: formData.licenseExpiry || null
      };

      console.log('Updating vehicle data:', vehicleData);
      await vehicleService.updateVehicle(id, vehicleData);
      toast.success('Vehicle updated successfully');
      navigate(`/vehicles/${id}`);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to update vehicle. Please try again.';
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrors({ submit: errorMessage });
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData({ ...originalData });
      setErrors({});
    }
  };

  const handleCancel = () => {
    if (isFormModified()) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave without saving?'
      );
      if (!confirmed) return;
    }
    
    // Reset form to original state before navigating
    if (originalData) {
      setFormData({ ...originalData });
      setErrors({});
    }
    navigate(`/vehicles/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(`/vehicles/${id}`)}
          className="mr-4 p-2 rounded-md hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Vehicle</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Vehicle Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Number */}
            <div>
              <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number * <span className="text-xs text-gray-500">(max 8 characters)</span>
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
                Type *
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
                <option value="Lorry">Lorry</option>
                <option value="Heavy Machinery">Heavy Machinery</option>
                <option value="Scooter">Scooter</option>
                <option value="Electric bike (E-bike)">Electric bike (E-bike)</option>
                <option value="Tuk-tuk (Three-wheeler)">Tuk-tuk (Three-wheeler)</option>
                <option value="Jeep">Jeep</option>
                <option value="Electric car (EV)">Electric car (EV)</option>
                <option value="Hybrid car">Hybrid car</option>
                <option value="Electric van">Electric van</option>
                <option value="Electric bike/scooter">Electric bike/scooter</option>
                <option value="Other">Other</option>
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>

            {/* Vehicle Make/Brand */}
            <div>
              <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-2">
                Make/Brand *
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
                <optgroup label="Car Brands">
                  <option value="Toyota">Toyota</option>
                  <option value="Honda">Honda</option>
                  <option value="Ford">Ford</option>
                  <option value="BMW">BMW</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Audi">Audi</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Kia">Kia</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Subaru">Subaru</option>
                  <option value="Lexus">Lexus</option>
                  <option value="Tesla">Tesla</option>
                </optgroup>
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
                </optgroup>
                <optgroup label="Commercial Vehicle Brands">
                  <option value="Tata">Tata</option>
                  <option value="Ashok Leyland">Ashok Leyland</option>
                  <option value="Mahindra">Mahindra</option>
                  <option value="Eicher">Eicher</option>
                  <option value="Force Motors">Force Motors</option>
                  <option value="Isuzu">Isuzu</option>
                  <option value="Volvo Trucks">Volvo Trucks</option>
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

            {/* Insurance Expiry - OPTIONAL for editing */}
            <div>
              <label htmlFor="insuranceExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Expiry <span className="text-xs text-gray-500">(optional - can be removed)</span>
              </label>
              <input
                type="date"
                id="insuranceExpiry"
                name="insuranceExpiry"
                value={formData.insuranceExpiry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to remove existing date</p>
            </div>

            {/* License Expiry - OPTIONAL for editing */}
            <div>
              <label htmlFor="licenseExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                License Expiry <span className="text-xs text-gray-500">(optional - can be removed)</span>
              </label>
              <input
                type="date"
                id="licenseExpiry"
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to remove existing date</p>
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
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="CNG">CNG</option>
                <option value="LPG">LPG</option>
              </select>
            </div>

            {/* Monthly Mileage - Start */}
            <div>
              <label htmlFor="monthStartMileage" className="block text-sm font-medium text-gray-700 mb-2">
                Month Start Mileage (km) <span className="text-xs text-gray-500">(optional)</span>
              </label>
              <input
                type="number"
                id="monthStartMileage"
                name="monthStartMileage"
                value={formData.monthStartMileage}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.monthStartMileage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter start of month mileage"
              />
              {errors.monthStartMileage && <p className="mt-1 text-sm text-red-600">{errors.monthStartMileage}</p>}
            </div>

            {/* Monthly Mileage - End */}
            <div>
              <label htmlFor="monthEndMileage" className="block text-sm font-medium text-gray-700 mb-2">
                Month End Mileage (km) <span className="text-xs text-gray-500">(optional)</span>
              </label>
              <input
                type="number"
                id="monthEndMileage"
                name="monthEndMileage"
                value={formData.monthEndMileage}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.monthEndMileage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter end of month mileage"
              />
              {errors.monthEndMileage && <p className="mt-1 text-sm text-red-600">{errors.monthEndMileage}</p>}
              {formData.monthStartMileage && formData.monthEndMileage && (
                <p className="mt-1 text-sm text-blue-600">
                  Monthly Distance: {parseFloat(formData.monthEndMileage) - parseFloat(formData.monthStartMileage) || 0} km
                </p>
              )}
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="In Service">In Service</option>
                <option value="Out of Service">Out of Service</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                Condition *
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Vehicle Images */}
          <div className="mt-6">
            <label htmlFor="vehicleImages" className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Images <span className="text-xs text-gray-500">(max 3 images)</span>
            </label>
            <input
              type="file"
              id="vehicleImages"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={formData.imageUrls.length >= 3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: JPEG, PNG, GIF, WebP. Maximum 3 images.
            </p>
            
            {/* Image Previews */}
            {formData.imageUrls.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-3 gap-4">
                  {formData.imageUrls.map((url, index) => (
                    <div key={`image-${index}-${url.substring(0, 20)}`} className="relative">
                      <img
                        src={url}
                        alt={`Vehicle preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
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
            onClick={handleReset}
            className="px-6 py-2 border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Updating...' : 'Update Vehicle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVehicle;
