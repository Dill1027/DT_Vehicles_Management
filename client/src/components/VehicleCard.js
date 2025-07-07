import React from 'react';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const VehicleCard = ({ vehicle, onEdit, onDelete, onView }) => {
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
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Expired ${Math.abs(diffDays)} days ago`;
    } else if (diffDays <= 30) {
      return `Expires in ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
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

  const handleCardClick = () => {
    if (onView) {
      onView(vehicle);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
      onClick={handleCardClick}
    >
      <div className="p-6">
        {/* Vehicle Image */}
        {(vehicle.vehicleImages && vehicle.vehicleImages.length > 0) || vehicle.imageUrl ? (
          <div className="mb-4">
            <img
              src={(vehicle.vehicleImages && vehicle.vehicleImages[0]) || vehicle.imageUrl}
              alt={`${vehicle.make} ${vehicle.vehicleNumber}`}
              className="w-full h-32 object-cover rounded-md"
            />
            {vehicle.vehicleImages && vehicle.vehicleImages.length > 1 && (
              <p className="text-xs text-gray-500 mt-1">
                +{vehicle.vehicleImages.length - 1} more image{vehicle.vehicleImages.length > 2 ? 's' : ''}
              </p>
            )}
          </div>
        ) : null}

        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {vehicle.vehicleNumber || `${vehicle.make} ${vehicle.year}`}
            </h3>
            <p className="text-gray-600">{vehicle.make} {vehicle.type} {vehicle.year}</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
              {vehicle.status || 'Unknown'}
            </span>
            {vehicle.condition && (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(vehicle.condition)}`}>
                {vehicle.condition}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {vehicle.vehicleNumber && (
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle Number:</span>
              <span className="font-medium">{vehicle.vehicleNumber}</span>
            </div>
          )}
          {vehicle.type && (
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{vehicle.type}</span>
            </div>
          )}
          {vehicle.fuelType && (
            <div className="flex justify-between">
              <span className="text-gray-600">Fuel Type:</span>
              <span className="font-medium">{vehicle.fuelType}</span>
            </div>
          )}
          {vehicle.monthlyMileage && (
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Distance:</span>
              <span className="font-medium">{vehicle.monthlyMileage} km</span>
            </div>
          )}
          {vehicle.monthStartMileage && vehicle.monthEndMileage && (
            <div className="flex justify-between">
              <span className="text-gray-600">Mileage Range:</span>
              <span className="font-medium">{vehicle.monthStartMileage} - {vehicle.monthEndMileage} km</span>
            </div>
          )}
        </div>

        {/* Expiry Alerts */}
        <div className="space-y-2 mb-4">
          {vehicle.insuranceExpiry && (
            <div className={`p-2 rounded-md ${
              isExpired(vehicle.insuranceExpiry) 
                ? 'bg-red-50 border border-red-200' 
                : isExpiringSoon(vehicle.insuranceExpiry) 
                ? 'bg-yellow-50 border border-yellow-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <p className={`text-sm ${
                isExpired(vehicle.insuranceExpiry) 
                  ? 'text-red-700' 
                  : isExpiringSoon(vehicle.insuranceExpiry) 
                  ? 'text-yellow-700' 
                  : 'text-green-700'
              }`}>
                <span className="font-medium">Insurance:</span> {formatDate(vehicle.insuranceExpiry)}
              </p>
            </div>
          )}
          {vehicle.licenseExpiry && (
            <div className={`p-2 rounded-md ${
              isExpired(vehicle.licenseExpiry) 
                ? 'bg-red-50 border border-red-200' 
                : isExpiringSoon(vehicle.licenseExpiry) 
                ? 'bg-yellow-50 border border-yellow-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <p className={`text-sm ${
                isExpired(vehicle.licenseExpiry) 
                  ? 'text-red-700' 
                  : isExpiringSoon(vehicle.licenseExpiry) 
                  ? 'text-yellow-700' 
                  : 'text-green-700'
              }`}>
                <span className="font-medium">License:</span> {formatDate(vehicle.licenseExpiry)}
              </p>
            </div>
          )}
        </div>

        {vehicle.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Notes:</span> {vehicle.notes}
            </p>
          </div>
        )}

        <div className="flex space-x-2 pt-4 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onView) onView(vehicle);
            }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <EyeIcon className="h-4 w-4" />
            View
          </button>
          
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(vehicle);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(vehicle._id || vehicle.id);
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
