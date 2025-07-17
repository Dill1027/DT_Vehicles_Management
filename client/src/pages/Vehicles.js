import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import VehicleCard from '../components/VehicleCard';
import VehicleModal from '../components/VehicleModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);

  const navigate = useNavigate();

  const vehiclesPerPage = 12;

  useEffect(() => {
    fetchVehicles();
  }, [currentPage, searchTerm, filterStatus, filterType]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: vehiclesPerPage,
        search: searchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        type: filterType !== 'all' ? filterType : undefined
      };

      const response = await vehicleService.getAllVehicles(params);
      
      // Handle both structured and simple response formats
      if (response.data && response.data.vehicles) {
        // Structured response with pagination
        setVehicles(response.data.vehicles);
        setTotalPages(response.data.totalPages || 1);
        setTotalVehicles(response.data.totalVehicles || 0);
      } else {
        // Simple array response (fallback)
        const vehicleArray = response.data || [];
        setVehicles(vehicleArray);
        setTotalPages(Math.ceil(vehicleArray.length / vehiclesPerPage));
        setTotalVehicles(vehicleArray.length);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to fetch vehicles');
      // Set empty state on error
      setVehicles([]);
      setTotalPages(1);
      setTotalVehicles(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vehicleId) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.deleteVehicle(vehicleId);
        toast.success('Vehicle deleted successfully');
        fetchVehicles();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const handleEdit = (vehicle) => {
    navigate(`/vehicles/${vehicle._id || vehicle.id}/edit`);
  };

  const handleView = (vehicle) => {
    navigate(`/vehicles/${vehicle._id}`);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedVehicle(null);
    fetchVehicles();
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilterChange = (e) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6">
      {/* Header - Mobile Enhanced */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Vehicle Management
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 font-medium text-sm sm:text-base">
            {totalVehicles} vehicle{totalVehicles !== 1 ? 's' : ''} found
          </p>
        </div>
        <Link
          to="/vehicles/add"
          className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
        >
          <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm sm:text-base">Add New Vehicle</span>
        </Link>
      </div>

      {/* Search and Filters - Mobile Enhanced */}
      <div className="mb-6 sm:mb-8 bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="w-full">
            <div className="relative group">
              <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6 absolute left-3 sm:left-4 top-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search by vehicle number, make, model..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-base sm:text-lg shadow-sm hover:shadow-md"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm flex-shrink-0">
                <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <select
                value={filterStatus}
                onChange={handleStatusFilterChange}
                className="flex-1 px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md font-medium text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="in maintenance">In Maintenance</option>
                <option value="inactive">Inactive</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            <div className="w-full sm:w-auto">
              <select
                value={filterType}
                onChange={handleTypeFilterChange}
                className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md font-medium text-sm sm:text-base"
              >
                <option value="all">All Types</option>
                <option value="car">Car</option>
                <option value="truck">Truck</option>
                <option value="van">Van</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="bus">Bus</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Grid - Mobile Enhanced */}
      {loading ? (
        <div className="flex justify-center py-12 sm:py-16">
          <div className="bg-white/90 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-lg">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      ) : (
        <>
          {vehicles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {vehicles.map((vehicle, index) => (
                  <div key={vehicle.id || vehicle._id || index} className="transform hover:scale-105 transition-all duration-300">
                    <VehicleCard
                      vehicle={vehicle}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination - Mobile Enhanced */}
              {totalPages > 1 && (
                <div className="mt-8 sm:mt-12 flex justify-center px-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-2">
                    <div className="flex space-x-1 sm:space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-sm"
                      >
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        // Show fewer page numbers on mobile
                        const showPage = window.innerWidth < 640 ? 
                          (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) :
                          true;
                        
                        if (!showPage) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-sm ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                                : 'text-gray-600 bg-white border border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 shadow-sm"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8 sm:p-12 max-w-md mx-auto">
                <div className="text-gray-400 mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
                    <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No vehicles found</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 font-medium text-sm sm:text-base">
                  {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by adding your first vehicle.'
                  }
                </p>
                <Link
                  to="/vehicles/add"
                  className="group inline-flex items-center px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Add Vehicle
                </Link>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <VehicleModal
          vehicle={selectedVehicle}
          onClose={handleModalClose}
          onSave={handleModalClose}
        />
      )}
    </div>
  );
};

export default Vehicles;
