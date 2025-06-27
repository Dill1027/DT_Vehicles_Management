import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { vehicleService } from '../services/vehicleService';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);

  useEffect(() => {
    fetchVehicleDetails();
    fetchMaintenanceHistory();
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

  const fetchMaintenanceHistory = async () => {
    try {
      setLoadingMaintenance(true);
      const response = await vehicleService.getVehicleMaintenanceHistory(id);
      setMaintenanceHistory(response.data);
    } catch (error) {
      console.error('Error fetching maintenance history:', error);
    } finally {
      setLoadingMaintenance(false);
    }
  };

  const handleDelete = async () => {
    if (!hasPermission('vehicles.delete')) {
      toast.error('You do not have permission to delete vehicles');
      return;
    }

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
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in-use':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'retired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', days: Math.abs(daysUntilExpiry), color: 'text-red-600' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', days: daysUntilExpiry, color: 'text-yellow-600' };
    } else {
      return { status: 'valid', days: daysUntilExpiry, color: 'text-green-600' };
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
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
          {hasPermission('vehicles.edit') && (
            <Link
              to={`/vehicles/${id}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </Link>
          )}
          {hasPermission('vehicles.delete') && (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Image */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
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
            
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                {vehicle.status?.charAt(0).toUpperCase() + vehicle.status?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Vehicle Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Vehicle Number</div>
                  <p className="text-gray-900">{vehicle.vehicleNumber || 'N/A'}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">License Plate</div>
                  <p className="text-gray-900">{vehicle.licensePlate || 'N/A'}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Make</div>
                  <p className="text-gray-900">{vehicle.make || 'N/A'}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Model</div>
                  <p className="text-gray-900">{vehicle.model || 'N/A'}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Year</div>
                  <p className="text-gray-900">{vehicle.year || 'N/A'}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Type</div>
                  <p className="text-gray-900">{vehicle.type || 'N/A'}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Color</div>
                  <p className="text-gray-900">{vehicle.color || 'N/A'}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">VIN</div>
                  <p className="text-gray-900">{vehicle.vin || 'N/A'}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Mileage</div>
                  <p className="text-gray-900">{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'N/A'}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Fuel Type</div>
                  <p className="text-gray-900">{vehicle.fuelType || 'N/A'}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Department</div>
                  <p className="text-gray-900">{vehicle.department || 'N/A'}</p>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Purchase Date</div>
                  <p className="text-gray-900">{formatDate(vehicle.purchaseDate)}</p>
                </div>
              </div>

              {vehicle.notes && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700">Notes</div>
                  <p className="text-gray-900 mt-1">{vehicle.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expiry Information */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Expiry Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Insurance Expiry', date: vehicle.insuranceExpiry, field: 'insurance' },
            { label: 'Emission Test Expiry', date: vehicle.emissionExpiry, field: 'emission' },
            { label: 'Revenue License Expiry', date: vehicle.revenueExpiry, field: 'revenue' },
            { label: 'Lease Due', date: vehicle.leaseDue, field: 'lease' }
          ].map(({ label, date, field }) => {
            const expiryStatus = getExpiryStatus(date);
            
            return (
              <div key={field} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">{label}</h3>
                  {expiryStatus && (
                    <div className="flex items-center">
                      {(() => {
                        if (expiryStatus.status === 'expired') {
                          return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
                        } else if (expiryStatus.status === 'expiring') {
                          return <ClockIcon className="h-4 w-4 text-yellow-500" />;
                        } else {
                          return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
                        }
                      })()}
                    </div>
                  )}
                </div>
                
                <p className="text-gray-900 mb-1">{formatDate(date)}</p>
                
                {expiryStatus && (
                  <p className={`text-xs ${expiryStatus.color}`}>
                    {(() => {
                      if (expiryStatus.status === 'expired') {
                        return `Expired ${expiryStatus.days} days ago`;
                      } else if (expiryStatus.status === 'expiring') {
                        return `Expires in ${expiryStatus.days} days`;
                      } else {
                        return `Valid for ${expiryStatus.days} days`;
                      }
                    })()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Maintenance History */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Maintenance History</h2>
            {hasPermission('create_maintenance') && (
              <Link
                to={`/maintenance/add?vehicle=${id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Schedule Maintenance
              </Link>
            )}
          </div>

          {loadingMaintenance ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {maintenanceHistory.length > 0 ? (
                <div className="space-y-4">
                  {maintenanceHistory.map((maintenance) => {
                    const getMaintenanceStatusColor = (status) => {
                      if (status === 'Completed') return 'bg-green-100 text-green-800';
                      if (status === 'In Progress') return 'bg-blue-100 text-blue-800';
                      return 'bg-yellow-100 text-yellow-800';
                    };

                    return (
                      <div key={maintenance._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{maintenance.description}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMaintenanceStatusColor(maintenance.status)}`}>
                            {maintenance.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {formatDate(maintenance.scheduledDate)}
                          </span>
                          <span>Type: {maintenance.type}</span>
                          <span>Category: {maintenance.category}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No maintenance history found.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
