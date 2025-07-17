import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';

const AddVehicle = () => {
  const navigate = useNavigate();
  const initialFormData = {
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
  };
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 3 images
    if (files.length > 3) {
      alert('You can upload maximum 3 images');
      return;
    }

    // Check if adding new images would exceed limit
    if (formData.vehicleImages.length + files.length > 3) {
      alert(`You can only upload ${3 - formData.vehicleImages.length} more image(s)`);
      return;
    }

    const processFiles = async () => {
      const newImages = [];
      const newImageUrls = [];

      for (const file of files) {
        if (file) {
          // Check file size (limit to 5MB)
          if (file.size > 5 * 1024 * 1024) {
            alert(`File ${file.name} is too large. Maximum size is 5MB.`);
            continue;
          }

          // Check file type
          if (!file.type.startsWith('image/')) {
            alert(`File ${file.name} is not a valid image.`);
            continue;
          }

          const url = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => {
              console.error('Error reading file:', file.name);
              resolve(null);
            };
            reader.readAsDataURL(file);
          });
          
          if (url) {
            newImages.push(file);
            newImageUrls.push(url);
            console.log(`Processed image: ${file.name}, size: ${file.size} bytes`);
          }
        }
      }

      if (newImages.length > 0) {
        setFormData(prev => ({
          ...prev,
          vehicleImages: [...prev.vehicleImages, ...newImages],
          imageUrls: [...prev.imageUrls, ...newImageUrls]
        }));
        console.log(`Added ${newImages.length} image(s)`);
      }
    };

    processFiles();
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
    if (!formData.insuranceExpiry) newErrors.insuranceExpiry = 'Insurance expiry date is required';
    if (!formData.licenseExpiry) newErrors.licenseExpiry = 'License expiry date is required';
    
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

    setLoading(true);
    try {
      // Create vehicle object - remove any extra frontend-only fields
      const {
        vehicleImages, // Exclude the File objects array
        imageUrls, // Exclude the imageUrls array  
        ...cleanFormData
      } = formData;
      
      const vehicleData = {
        ...cleanFormData,
        year: formData.year ? parseInt(formData.year) : null,
        monthStartMileage: formData.monthStartMileage ? parseFloat(formData.monthStartMileage) : 0,
        monthEndMileage: formData.monthEndMileage ? parseFloat(formData.monthEndMileage) : 0,
        vehicleImages: formData.imageUrls || [], // Use the base64 URLs
        monthlyMileage: formData.monthEndMileage && formData.monthStartMileage 
          ? parseFloat(formData.monthEndMileage) - parseFloat(formData.monthStartMileage) 
          : 0
      };

      console.log('Sending vehicle data:', vehicleData);
      console.log('Image count:', vehicleData.vehicleImages.length);
      console.log('First image preview:', vehicleData.vehicleImages[0]?.substring(0, 50) + '...');
      
      await vehicleService.createVehicle(vehicleData);
      navigate('/vehicles');
    } catch (error) {
      console.error('Error creating vehicle:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to create vehicle. Please try again.';
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/vehicles');
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header - Mobile Enhanced */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border border-white/20 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            Add New Vehicle
          </h1>
          <p className="text-gray-600 font-medium text-sm sm:text-base">
            Fill in the details to register a new vehicle in the system
          </p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
            <div className="p-2 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 mr-2 sm:mr-3 flex-shrink-0">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            Vehicle Information
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Vehicle Number - Mobile Enhanced */}
            <div className="group">
              <label htmlFor="vehicleNumber" className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                Vehicle Number * <span className="text-xs text-gray-500 font-normal">(max 8 characters)</span>
              </label>
              <input
                type="text"
                id="vehicleNumber"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                maxLength="8"
                className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base sm:text-lg shadow-sm hover:shadow-md ${
                  errors.vehicleNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 group-hover:border-blue-300'
                }`}
                placeholder="ABC-1234"
              />
              <div className="flex justify-between mt-1 sm:mt-2">
                {errors.vehicleNumber && <p className="text-xs sm:text-sm text-red-600 font-medium">{errors.vehicleNumber}</p>}
                <p className="text-xs text-gray-500 ml-auto font-medium">{formData.vehicleNumber.length}/8</p>
              </div>
            </div>

            {/* Vehicle Type - Mobile Enhanced */}
            <div className="group">
              <label htmlFor="type" className="block text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full px-3 sm:px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base sm:text-lg shadow-sm hover:shadow-md ${
                  errors.type ? 'border-red-500 bg-red-50' : 'border-gray-300 group-hover:border-blue-300'
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
              {errors.type && <p className="mt-2 text-sm text-red-600 font-medium">{errors.type}</p>}
            </div>

            {/* Vehicle Make/Brand */}
            <div className="group">
              <label htmlFor="make" className="block text-sm font-bold text-gray-700 mb-3">
                Make/Brand *
              </label>
              <select
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg shadow-sm hover:shadow-md ${
                  errors.make ? 'border-red-500 bg-red-50' : 'border-gray-300 group-hover:border-blue-300'
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
                  <option value="Platina">Platina</option>
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
              {errors.make && <p className="mt-2 text-sm text-red-600 font-medium">{errors.make}</p>}
            </div>

            {/* Year */}
            <div className="group">
              <label htmlFor="year" className="block text-sm font-bold text-gray-700 mb-3">
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
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg shadow-sm hover:shadow-md ${
                  errors.year ? 'border-red-500 bg-red-50' : 'border-gray-300 group-hover:border-blue-300'
                }`}
                placeholder="2024"
              />
              {errors.year && <p className="mt-2 text-sm text-red-600 font-medium">{errors.year}</p>}
            </div>

            {/* Insurance Expiry */}
            <div className="group">
              <label htmlFor="insuranceExpiry" className="block text-sm font-bold text-gray-700 mb-3">
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

            {/* License Expiry */}
            <div>
              <label htmlFor="licenseExpiry" className="block text-sm font-medium text-gray-700 mb-2">
                License Expiry *
              </label>
              <input
                type="date"
                id="licenseExpiry"
                name="licenseExpiry"
                value={formData.licenseExpiry}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.licenseExpiry ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.licenseExpiry && <p className="mt-1 text-sm text-red-600">{errors.licenseExpiry}</p>}
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
              disabled={formData.vehicleImages.length >= 3}
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

        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="group px-6 py-3 border border-yellow-300 rounded-xl text-yellow-700 font-semibold hover:bg-gradient-to-r hover:from-yellow-50 hover:to-yellow-100 hover:border-yellow-400 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
            >
              <span className="group-hover:scale-110 transition-transform duration-300 inline-block">Reset</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="group px-6 py-3 border border-red-300 rounded-xl text-red-700 font-semibold hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:border-red-400 transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md"
            >
              <span className="group-hover:scale-110 transition-transform duration-300 inline-block">Cancel</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="group px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                <span className="group-hover:scale-110 transition-transform duration-300 inline-block">Create Vehicle</span>
              )}
            </button>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
};

export default AddVehicle;
