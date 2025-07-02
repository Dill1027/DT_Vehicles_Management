import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

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
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in-use':
      case 'in use':
        return 'bg-blue-100 text-blue-800';
      case 'inactive':
      case 'retired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-gray-600">{vehicle.vehicleNumber}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          { (
            <Link
              to={`/vehicles/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </Link>
          )}
          { (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Image and Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="aspect-video bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
            {vehicle.imageUrl ? (
              <img
                src={vehicle.imageUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-gray-400">
                <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Status Info */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Current Status</span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                {vehicle.status?.charAt(0).toUpperCase() + vehicle.status?.slice(1) || 'Unknown'}
              </span>
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
                <div className="text-sm font-medium text-gray-700 mb-1">License Plate</div>
                <p className="text-lg font-semibold text-gray-900">{vehicle.licensePlate || 'N/A'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Make & Model</div>
                <p className="text-gray-900">{vehicle.make} {vehicle.model}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Year</div>
                <p className="text-gray-900">{vehicle.year || 'N/A'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Type</div>
                <p className="text-gray-900">{vehicle.type || 'N/A'}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Fuel Type</div>
                <p className="text-gray-900">{vehicle.fuelType || 'N/A'}</p>
              </div>
            </div>
            
            {vehicle.mileage && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Current Mileage</div>
                <p className="text-lg font-semibold text-gray-900">{vehicle.mileage.toLocaleString()} km</p>
              </div>
            )}
            
            {vehicle.department && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Department</div>
                <p className="text-gray-900">{vehicle.department}</p>
              </div>
            )}

            {vehicle.notes && (
              <div className="pt-4 border-t">
                <div className="text-sm font-medium text-gray-700 mb-2">Additional Notes</div>
                <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded-md">{vehicle.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
