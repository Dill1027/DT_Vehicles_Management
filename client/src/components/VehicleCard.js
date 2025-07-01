import React from 'react';

const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in-use':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-gray-600">{vehicle.year}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
          {vehicle.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Vehicle ID:</span>
          <span className="font-medium">{vehicle.vehicleId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">License Plate:</span>
          <span className="font-medium">{vehicle.licensePlate}</span>
        </div>
        {vehicle.color && (
          <div className="flex justify-between">
            <span className="text-gray-600">Color:</span>
            <span className="font-medium">{vehicle.color}</span>
          </div>
        )}
        {vehicle.mileage && (
          <div className="flex justify-between">
            <span className="text-gray-600">Mileage:</span>
            <span className="font-medium">{vehicle.mileage.toLocaleString()} miles</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Fuel Type:</span>
          <span className="font-medium capitalize">{vehicle.fuelType}</span>
        </div>
      </div>

      {vehicle.nextMaintenanceDate && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Next Maintenance:</span>{' '}
            {new Date(vehicle.nextMaintenanceDate).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(vehicle)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(vehicle._id || vehicle.id)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;
