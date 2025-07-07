import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { vehicleService } from '../services/vehicleService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchVehicleDetails();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getVehicleById(id);
      setVehicle(response.data);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      toast.error('Failed to fetch vehicle details');
      navigate('/vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      try {
        await vehicleService.deleteVehicle(id);
        toast.success('Vehicle deleted successfully');
        navigate('/vehicles');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'in service':
        return 'bg-blue-100 text-blue-800';
      case 'out of service':
        return 'bg-orange-100 text-orange-800';
      case 'under maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const isExpiringSoon = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
  };

  const isInMaintenance = () => {
    return vehicle?.status?.toLowerCase().includes('maintenance');
  };

  // Image gallery functions
  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    const images = vehicle.vehicleImages || [vehicle.imageUrl].filter(Boolean);
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = vehicle.vehicleImages || [vehicle.imageUrl].filter(Boolean);
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Vehicle not found</h3>
        <Link to="/vehicles" className="text-blue-600 hover:text-blue-800">
          Back to vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/vehicles')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Vehicles
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {vehicle.vehicleNumber || `${vehicle.make} ${vehicle.year}`}
            </h1>
            <p className="text-gray-600">{vehicle.make} {vehicle.type}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/vehicles/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
          >
            <PencilIcon className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
          >
            <TrashIcon className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Images and Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Vehicle Images */}
          <div className="mb-6">
            {(vehicle.vehicleImages && vehicle.vehicleImages.length > 0) || vehicle.imageUrl ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Images</h3>
                
                {/* All Images Grid */}
                <div className="grid grid-cols-1 gap-4">
                  {vehicle.vehicleImages && vehicle.vehicleImages.length > 0 ? (
                    // Multiple images from vehicleImages array
                    vehicle.vehicleImages.map((url, index) => (
                      <div key={`vehicle-photo-${index}`} className="relative group">
                        <img
                          src={url}
                          alt={`${vehicle.make} ${vehicle.vehicleNumber} ${index + 1}`}
                          className="w-full h-64 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => openImageModal(index)}
                        />
                        <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                          {index + 1} of {vehicle.vehicleImages.length}
                        </div>
                      </div>
                    ))
                  ) : vehicle.imageUrl ? (
                    // Single image from imageUrl
                    <div className="relative group">
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.make} ${vehicle.vehicleNumber}`}
                        className="w-full h-64 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => openImageModal(0)}
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                        1 of 1
                      </div>
                    </div>
                  ) : null}
                </div>
                
                {/* Click to view instruction */}
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Click on any image to view in full size
                </p>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
                <div className="text-gray-400">
                  <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          {/* Status and Maintenance Info */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Current Status</span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                {vehicle.status?.charAt(0).toUpperCase() + vehicle.status?.slice(1) || 'Unknown'}
              </span>
            </div>

            {vehicle.condition && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Condition</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getConditionColor(vehicle.condition)}`}>
                  {vehicle.condition}
                </span>
              </div>
            )}
            
            {/* Maintenance Status */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Maintenance Status</span>
                <div className="flex items-center gap-2">
                  {isInMaintenance() ? (
                    <>
                      <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
                      <span className="text-orange-600 font-medium">In Maintenance</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-green-600 font-medium">Operational</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className={`p-4 rounded-lg text-sm ${isInMaintenance() ? 'bg-orange-50 text-orange-800' : 'bg-green-50 text-green-800'}`}>
                {isInMaintenance() 
                  ? 'This vehicle is currently undergoing maintenance and is not available for use.'
                  : 'This vehicle is operational and available for use.'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Essential Vehicle Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Vehicle Information</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Vehicle Number</div>
                <p className="text-lg font-semibold text-gray-900">{vehicle.vehicleNumber || 'N/A'}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Year</div>
                <p className="text-lg font-semibold text-gray-900">{vehicle.year || 'N/A'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Make</div>
                <p className="text-gray-900">{vehicle.make || 'N/A'}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Type</div>
                <p className="text-gray-900">{vehicle.type || 'N/A'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Fuel Type</div>
                <p className="text-gray-900">{vehicle.fuelType || 'N/A'}</p>
              </div>
              {vehicle.monthlyMileage ? (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Monthly Distance</div>
                  <p className="text-gray-900">{vehicle.monthlyMileage} km</p>
                </div>
              ) : null}
            </div>

            {/* Mileage Range */}
            {vehicle.monthStartMileage && vehicle.monthEndMileage && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Month Start Mileage</div>
                  <p className="text-gray-900">{vehicle.monthStartMileage} km</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Month End Mileage</div>
                  <p className="text-gray-900">{vehicle.monthEndMileage} km</p>
                </div>
              </div>
            )}

            {/* Expiry Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal Documentation</h3>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${
                  isExpired(vehicle.insuranceExpiry) 
                    ? 'bg-red-50 border-red-200' 
                    : isExpiringSoon(vehicle.insuranceExpiry) 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Insurance Expiry</span>
                    <span className={`text-sm font-medium ${
                      isExpired(vehicle.insuranceExpiry) 
                        ? 'text-red-600' 
                        : isExpiringSoon(vehicle.insuranceExpiry) 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                    }`}>
                      {formatDate(vehicle.insuranceExpiry)}
                    </span>
                  </div>
                  {(isExpired(vehicle.insuranceExpiry) || isExpiringSoon(vehicle.insuranceExpiry)) && (
                    <p className={`text-xs mt-1 ${
                      isExpired(vehicle.insuranceExpiry) ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {isExpired(vehicle.insuranceExpiry) ? 'Expired!' : 'Expires soon!'}
                    </p>
                  )}
                </div>

                <div className={`p-4 rounded-lg border ${
                  isExpired(vehicle.licenseExpiry) 
                    ? 'bg-red-50 border-red-200' 
                    : isExpiringSoon(vehicle.licenseExpiry) 
                    ? 'bg-yellow-50 border-yellow-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">License Expiry</span>
                    <span className={`text-sm font-medium ${
                      isExpired(vehicle.licenseExpiry) 
                        ? 'text-red-600' 
                        : isExpiringSoon(vehicle.licenseExpiry) 
                        ? 'text-yellow-600' 
                        : 'text-green-600'
                    }`}>
                      {formatDate(vehicle.licenseExpiry)}
                    </span>
                  </div>
                  {(isExpired(vehicle.licenseExpiry) || isExpiringSoon(vehicle.licenseExpiry)) && (
                    <p className={`text-xs mt-1 ${
                      isExpired(vehicle.licenseExpiry) ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {isExpired(vehicle.licenseExpiry) ? 'Expired!' : 'Expires soon!'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {vehicle.notes && (
              <div className="pt-4 border-t">
                <div className="text-sm font-medium text-gray-700 mb-2">Additional Notes</div>
                <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-md">{vehicle.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            {/* Close button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            {/* Navigation buttons */}
            {((vehicle.vehicleImages && vehicle.vehicleImages.length > 1) || (vehicle.imageUrl && vehicle.vehicleImages)) && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-opacity"
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </button>
              </>
            )}
            
            {/* Image */}
            <img
              src={
                vehicle.vehicleImages && vehicle.vehicleImages.length > 0
                  ? vehicle.vehicleImages[selectedImageIndex]
                  : vehicle.imageUrl
              }
              alt={`${vehicle.make} ${vehicle.vehicleNumber}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
              {vehicle.vehicleImages && vehicle.vehicleImages.length > 0
                ? `${selectedImageIndex + 1} of ${vehicle.vehicleImages.length}`
                : "1 of 1"
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetail;
