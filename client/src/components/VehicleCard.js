import React from 'react';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const VehicleCard = ({ vehicle, onEdit, onDelete, onView }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in-use':
      case 'in use':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
      case 'in maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {vehicle.vehicleNumber || `${vehicle.make} ${vehicle.model}`}
            </h3>
            <p className="text-gray-600">{vehicle.make} {vehicle.model} {vehicle.year}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
            {vehicle.status || 'Unknown'}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {vehicle.vehicleNumber && (
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle Number:</span>
              <span className="font-medium">{vehicle.vehicleNumber}</span>
            </div>
          )}
          {vehicle.licensePlate && (
            <div className="flex justify-between">
              <span className="text-gray-600">License Plate:</span>
              <span className="font-medium">{vehicle.licensePlate}</span>
            </div>
          )}
          {vehicle.type && (
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium">{vehicle.type}</span>
            </div>
          )}
          {vehicle.color && (
            <div className="flex justify-between">
              <span className="text-gray-600">Color:</span>
              <span className="font-medium">{vehicle.color}</span>
            </div>
          )}
          {vehicle.mileage && (
            <div className="flex justify-between">
              <span className="text-gray-600">Mileage:</span>
              <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
            </div>
          )}
          {vehicle.fuelType && (
            <div className="flex justify-between">
              <span className="text-gray-600">Fuel Type:</span>
              <span className="font-medium capitalize">{vehicle.fuelType}</span>
            </div>
          )}
        </div>

        {vehicle.nextMaintenanceDate && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Next Maintenance:</span>{' '}
              {new Date(vehicle.nextMaintenanceDate).toLocaleDateString()}
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
          
          { (
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
          
          { (
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
