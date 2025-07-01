import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { vehicleService } from '../services/vehicleService';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  TruckIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Maintenance = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const vehiclesPerPage = 12;

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAllVehicles();
      
      let allVehicles = response.data || [];
      
      // Apply status filter
      if (statusFilter !== 'all') {
        allVehicles = allVehicles.filter(vehicle => 
          vehicle.status && vehicle.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }
      
      // Apply search filter if search term exists
      if (searchTerm) {
        allVehicles = allVehicles.filter(vehicle => 
          vehicle.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Calculate pagination
      const startIndex = (currentPage - 1) * vehiclesPerPage;
      const endIndex = startIndex + vehiclesPerPage;
      const paginatedVehicles = allVehicles.slice(startIndex, endIndex);
      const totalPagesCount = Math.ceil(allVehicles.length / vehiclesPerPage);
      
      setVehicles(paginatedVehicles);
      setTotalPages(totalPagesCount);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, currentPage]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'in maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Overview</h1>
          <p className="text-gray-600 mt-1">
            Manage and view all vehicles in the fleet
          </p>
        </div>
        {hasPermission('create_vehicle') && (
          <Link
            to="/vehicles/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Vehicle
          </Link>
        )}
      </div>

      {/* Search and Filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by vehicle number, make, model, type, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-48">
            <div className="relative">
              <FunnelIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="in maintenance">In Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle, index) => (
                <button 
                  key={vehicle.id || vehicle._id || index} 
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left w-full"
                  onClick={() => navigate(`/vehicles/${vehicle._id || vehicle.id}`)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <TruckIcon className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {vehicle.vehicleNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {vehicle.make} {vehicle.model || ''}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="text-gray-900">{vehicle.type || 'N/A'}</span>
                      </div>
                      
                      {vehicle.fuelType && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Fuel:</span>
                          <span className="text-gray-900">{vehicle.fuelType}</span>
                        </div>
                      )}
                      
                      {vehicle.monthlyMileage && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Monthly Mileage:</span>
                          <span className="text-gray-900">{vehicle.monthlyMileage} km</span>
                        </div>
                      )}
                      
                      {vehicle.lastMaintenanceDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Last Maintenance:</span>
                          <span className="text-gray-900">{formatDate(vehicle.lastMaintenanceDate)}</span>
                        </div>
                      )}
                    </div>
                    
                    {vehicle.notes && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          <span className="font-medium">Notes:</span> {vehicle.notes}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button 
                        className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/vehicles/${vehicle._id || vehicle.id}`);
                        }}
                      >
                        <EyeIcon className="h-4 w-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <TruckIcon className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'No vehicles match your search criteria.'
                  : 'No vehicles have been added yet.'
                }
              </p>
              {hasPermission('create_vehicle') && (
                <Link
                  to="/vehicles/add"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add First Vehicle
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Maintenance;
