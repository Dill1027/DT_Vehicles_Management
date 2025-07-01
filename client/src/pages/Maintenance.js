import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { vehicleService } from '../services/vehicleService';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Maintenance = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const vehiclesPerPage = 10;

  const fetchMaintenanceVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getAllVehicles();
      
      let allVehicles = response.data || [];
      
      // Filter vehicles that are in maintenance status
      let maintenanceVehicles = allVehicles.filter(vehicle => 
        vehicle.status && vehicle.status.toLowerCase() === 'in maintenance'
      );
      
      // Apply search filter if search term exists
      if (searchTerm) {
        maintenanceVehicles = maintenanceVehicles.filter(vehicle => 
          vehicle.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Calculate pagination
      const startIndex = (currentPage - 1) * vehiclesPerPage;
      const endIndex = startIndex + vehiclesPerPage;
      const paginatedVehicles = maintenanceVehicles.slice(startIndex, endIndex);
      const totalPagesCount = Math.ceil(maintenanceVehicles.length / vehiclesPerPage);
      
      setVehicles(paginatedVehicles);
      setTotalPages(totalPagesCount);
    } catch (error) {
      console.error('Error fetching maintenance vehicles:', error);
      toast.error('Failed to fetch maintenance vehicles');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage]);

  useEffect(() => {
    fetchMaintenanceVehicles();
  }, [fetchMaintenanceVehicles]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
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
          <h1 className="text-3xl font-bold text-gray-900">Vehicles in Maintenance</h1>
          <p className="text-gray-600 mt-1">
            Vehicles currently under maintenance
          </p>
        </div>
        {hasPermission('create_maintenance') && (
          <Link
            to="/vehicles/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Vehicle
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by vehicle number, make, type, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {vehicles.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="divide-y divide-gray-200">
                {vehicles.map((vehicle, index) => (
                  <button 
                    key={vehicle.id || vehicle._id || index} 
                    className="w-full p-6 hover:bg-gray-50 cursor-pointer text-left"
                    onClick={() => navigate(`/vehicles/${vehicle._id || vehicle.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <WrenchScrewdriverIcon className="h-8 w-8 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-medium text-gray-900 truncate">
                              {vehicle.vehicleNumber}
                            </h3>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                              In Maintenance
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              {vehicle.make} {vehicle.model || ''}
                            </span>
                            <span>•</span>
                            <span>Type: {vehicle.type}</span>
                            {vehicle.fuelType && (
                              <>
                                <span>•</span>
                                <span>Fuel: {vehicle.fuelType}</span>
                              </>
                            )}
                          </div>
                          {vehicle.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {vehicle.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {vehicle.lastMaintenanceDate && (
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              Last Maintenance
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(vehicle.lastMaintenanceDate)}
                            </div>
                          </div>
                        )}
                        {vehicle.monthlyMileage && (
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.monthlyMileage} km
                            </div>
                            <div className="text-xs text-gray-500">
                              Monthly Mileage
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <WrenchScrewdriverIcon className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles in maintenance</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? 'No vehicles in maintenance match your search criteria.'
                  : 'Currently no vehicles are under maintenance.'
                }
              </p>
              {hasPermission('create_maintenance') && (
                <Link
                  to="/vehicles"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  View All Vehicles
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
