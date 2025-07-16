import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { vehicleService } from '../services/vehicleService';
import notificationService from '../services/notificationService';
import reportService from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  ExclamationTriangleIcon, 
  ClockIcon, 
  TruckIcon,
  DocumentArrowDownIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insuranceAlerts, setInsuranceAlerts] = useState([]);
  const [licenseAlerts, setLicenseAlerts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'insurance', 'license'
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    inUse: 0,
    maintenance: 0,
    insuranceExpiring: 0,
    insuranceExpired: 0,
    licenseExpiring: 0,
    licenseExpired: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        vehiclesResponse,
        statsResponse,
        insuranceAlertsResponse,
        licenseAlertsResponse
      ] = await Promise.all([
        vehicleService.getAllVehicles({ limit: 10 }),
        vehicleService.getVehicleStats(),
        notificationService.getInsuranceExpiryAlerts(30),
        notificationService.getLicenseExpiryAlerts(30)
      ]);

      // Fix for vehicles.slice is not a function error
      // Make sure we're getting an array of vehicles
      let vehiclesArray = [];
      if (Array.isArray(vehiclesResponse.data)) {
        vehiclesArray = vehiclesResponse.data;
      } else if (Array.isArray(vehiclesResponse.data?.data)) {
        vehiclesArray = vehiclesResponse.data.data;
      } else if (Array.isArray(vehiclesResponse.data?.vehicles)) {
        vehiclesArray = vehiclesResponse.data.vehicles;
      }
            
      setVehicles(vehiclesArray);
      
      const statsData = statsResponse.data || {};
      const insuranceAlerts = insuranceAlertsResponse.data || [];
      const licenseAlerts = licenseAlertsResponse.data || [];
      
      // Debug logging to help troubleshoot
      console.log('Dashboard data debug:', {
        vehiclesCount: vehiclesArray.length,
        insuranceAlertsCount: insuranceAlerts.length,
        licenseAlertsCount: licenseAlerts.length,
        sampleVehicle: vehiclesArray[0],
        sampleInsuranceAlert: insuranceAlerts[0],
        sampleLicenseAlert: licenseAlerts[0]
      });
      
      const expiredInsurance = insuranceAlerts.filter(alert => alert.isExpired);
      const expiringInsurance = insuranceAlerts.filter(alert => !alert.isExpired);
      
      const expiredLicense = licenseAlerts.filter(alert => alert.isExpired);
      const expiringLicense = licenseAlerts.filter(alert => !alert.isExpired);
      
      // Enhanced debug logging for expired items
      console.log('🔧 Dashboard Debug: Detailed Expired Items Analysis:');
      console.log('- Insurance Alerts Total:', insuranceAlerts.length);
      console.log('- Insurance Expired Count:', expiredInsurance.length);
      console.log('- Insurance Expiring Count:', expiringInsurance.length);
      console.log('- License Alerts Total:', licenseAlerts.length);
      console.log('- License Expired Count:', expiredLicense.length);
      console.log('- License Expiring Count:', expiringLicense.length);
      console.log('- Sample Expired Insurance:', expiredInsurance.slice(0, 2));
      console.log('- Sample Expired License:', expiredLicense.slice(0, 2));
      
      setStats({
        total: statsData.total || 0,
        available: statsData.available || 0,
        inUse: statsData.inUse || 0,
        maintenance: statsData.maintenance || 0,
        insuranceExpiring: expiringInsurance.length,
        insuranceExpired: expiredInsurance.length,
        licenseExpiring: expiringLicense.length,
        licenseExpired: expiredLicense.length
      });
      
      setInsuranceAlerts(insuranceAlerts);
      setLicenseAlerts(licenseAlerts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (type) => {
    try {
      toast.loading('Generating report...');
      
      switch (type) {
        case 'summary':
          await reportService.downloadVehicleSummaryReport();
          break;
        case 'expiry':
          await reportService.downloadExpiryAlertsReport(30);
          break;
        default:
          throw new Error('Unknown report type');
      }
      
      toast.dismiss();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate report');
      console.error('Report generation error:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in-use':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExpiryUrgency = (daysUntilExpiry) => {
    if (daysUntilExpiry < 0) return 'text-red-600 font-bold';
    if (daysUntilExpiry <= 7) return 'text-red-600';
    if (daysUntilExpiry <= 15) return 'text-orange-600';
    return 'text-yellow-600';
  };

  // Function to handle clicking on alert cards
  const handleFilterClick = (filterType) => {
    // If the same filter is clicked again, reset to 'all'
    if (activeFilter === filterType) {
      setActiveFilter('all');
    } else {
      setActiveFilter(filterType);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome to Vehicle Management!
          </h1>
          <p className="text-gray-600">Deep Tec Engineering Vehicle Management Dashboard</p>
        </div>
      </div>
      
      {/* Active Filter Banner */}
      {activeFilter !== 'all' && (
        <div className={`mt-4 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-2 shadow-sm ${
          activeFilter === 'insurance' ? 'bg-blue-50 border border-blue-200' : 'bg-purple-50 border border-purple-200'
        }`}>
          <div className="flex items-center">
            <BellIcon className={`h-5 w-5 mr-2 ${
              activeFilter === 'insurance' ? 'text-blue-600' : 'text-purple-600'
            }`} />
            <span className={`font-medium ${
              activeFilter === 'insurance' ? 'text-blue-700' : 'text-purple-700'
            }`}>
              Showing {activeFilter === 'insurance' ? 'Insurance' : 'License'} Expiry Alerts Only
            </span>
          </div>
          <button 
            onClick={() => setActiveFilter('all')} 
            className={`px-3 py-1 rounded-md text-sm font-medium flex items-center ${
              activeFilter === 'insurance' 
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filter
          </button>
        </div>
      )}
      
      {/* Stats Cards - Moved to top for better visibility */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        <Link to="/vehicles" className="bg-white p-4 md:p-6 rounded-lg shadow-sm block hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Vehicles</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </Link>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <div className="h-4 w-4 bg-green-600 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Available</h3>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">In Use</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.inUse}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <div className="h-4 w-4 bg-red-600 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">In Maintenance</h3>
              <p className="text-2xl font-bold text-red-600">{stats.maintenance}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Insurance Expiring Soon</h3>
              <p className="text-2xl font-bold text-orange-600">{stats.insuranceExpiring}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Insurance Expired</h3>
              <p className="text-2xl font-bold text-red-600">{stats.insuranceExpired}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-purple-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">License Expiring Soon</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.licenseExpiring}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-pink-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">License Expired</h3>
              <p className="text-2xl font-bold text-pink-600">{stats.licenseExpired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      {insuranceAlerts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {/* Expired Insurance Alert */}
          {insuranceAlerts.filter(alert => alert.isExpired).length > 0 && (
            <div 
              className="bg-red-50 border border-red-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:bg-red-100 transition-all transform hover:scale-[1.01] shadow-sm"
              onClick={() => handleFilterClick('insurance')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterClick('insurance')}
              aria-label="Filter by expired insurance"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">
                    {insuranceAlerts.filter(alert => alert.isExpired).length} Expired Insurance
                  </h3>
                  <p className="text-red-700">Immediate attention required</p>
                </div>
              </div>
            </div>
          )}

          {/* Expiring Soon Insurance Alert */}
          {insuranceAlerts.filter(alert => !alert.isExpired).length > 0 && (
            <div 
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:bg-yellow-100 transition-all transform hover:scale-[1.01] shadow-sm"
              onClick={() => handleFilterClick('insurance')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterClick('insurance')}
              aria-label="Filter by insurance expiring soon"
            >
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">
                    {insuranceAlerts.filter(alert => !alert.isExpired).length} Insurance Expiring Soon
                  </h3>
                  <p className="text-yellow-700">Click to view details</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alert Cards for License */}
      {licenseAlerts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          {/* Expired License Alert */}
          {licenseAlerts.filter(alert => alert.isExpired).length > 0 && (
            <div 
              className="bg-red-50 border border-red-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:bg-red-100 transition-all transform hover:scale-[1.01] shadow-sm"
              onClick={() => handleFilterClick('license')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterClick('license')}
              aria-label="Filter by expired license"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">
                    {licenseAlerts.filter(alert => alert.isExpired).length} Expired License
                  </h3>
                  <p className="text-red-700">Immediate attention required</p>
                </div>
              </div>
            </div>
          )}

          {/* Expiring Soon License Alert */}
          {licenseAlerts.filter(alert => !alert.isExpired).length > 0 && (
            <div 
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:bg-yellow-100 transition-all transform hover:scale-[1.01] shadow-sm"
              onClick={() => handleFilterClick('license')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterClick('license')}
              aria-label="Filter by license expiring soon"
            >
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">
                    {licenseAlerts.filter(alert => !alert.isExpired).length} License Expiring Soon
                  </h3>
                  <p className="text-yellow-700">Click to view details</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Vehicles */}
        {activeFilter === 'all' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent Vehicles</h2>
              <Link 
                to="/vehicles" 
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                View All
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(vehicles) && vehicles.length > 0 ? (
                  vehicles.slice(0, 5).map((vehicle, index) => (
                    <tr key={vehicle.id || vehicle._id || index} className="hover:bg-gray-50">
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.vehicleNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vehicle.make} {vehicle.model}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.department}
                      </td>
                      <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-3 md:px-6 py-4 text-center text-gray-500">
                      No vehicles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Insurance Expiry Alerts */}
        {(activeFilter === 'all' || activeFilter === 'insurance') && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Insurance Expiry Alerts</h2>
              {activeFilter === 'insurance' && (
                <button 
                  onClick={() => setActiveFilter('all')} 
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <span className="mr-1">Show All</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              {activeFilter === 'all' && <BellIcon className="h-6 w-6 text-gray-400" />}
            </div>
          <div className="p-4 md:p-6">
            {insuranceAlerts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No insurance expiry alerts
              </p>
            ) : (
              <div className="space-y-3">
                {/* Show expired insurance first */}
                {insuranceAlerts
                  .filter(alert => alert.isExpired)
                  .slice(0, 3)
                  .map((vehicle, index) => (
                    <div key={`expired-insurance-${vehicle.id || vehicle._id || index}`} className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <div>
                        <div className="font-medium text-gray-900">{vehicle.vehicleNumber}</div>
                        <div className="text-sm text-red-600">
                          Insurance - Expired {Math.abs(vehicle.daysUntilExpiry)} days ago
                        </div>
                      </div>
                      <span className="text-red-600 font-bold text-sm">EXPIRED</span>
                    </div>
                  ))}
                
                {/* Show expiring insurance */}
                {insuranceAlerts
                  .filter(alert => !alert.isExpired)
                  .slice(0, 3)
                  .map((vehicle, index) => (
                    <div key={`expiring-insurance-${vehicle.id || vehicle._id || index}`} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                      <div>
                        <div className="font-medium text-gray-900">{vehicle.vehicleNumber}</div>
                        <div className="text-sm text-gray-600">
                          Insurance expiring in {vehicle.daysUntilExpiry} days
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${getExpiryUrgency(vehicle.daysUntilExpiry)}`}>
                        {vehicle.daysUntilExpiry > 0 ? `${vehicle.daysUntilExpiry} days` : 'Expired'}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* License Expiry Alerts */}
        {(activeFilter === 'all' || activeFilter === 'license') && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">License Expiry Alerts</h2>
              {activeFilter === 'license' && (
                <button 
                  onClick={() => setActiveFilter('all')} 
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                >
                  <span className="mr-1">Show All</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              {activeFilter === 'all' && <BellIcon className="h-6 w-6 text-gray-400" />}
            </div>
          <div className="p-4 md:p-6">
            {licenseAlerts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No license expiry alerts
              </p>
            ) : (
              <div className="space-y-3">
                {/* Show expired license first */}
                {licenseAlerts
                  .filter(alert => alert.isExpired)
                  .slice(0, 3)
                  .map((vehicle, index) => (
                    <div key={`expired-license-${vehicle.id || vehicle._id || index}`} className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                      <div>
                        <div className="font-medium text-gray-900">{vehicle.vehicleNumber}</div>
                        <div className="text-sm text-red-600">
                          License - Expired {Math.abs(vehicle.daysUntilExpiry)} days ago
                        </div>
                      </div>
                      <span className="text-red-600 font-bold text-sm">EXPIRED</span>
                    </div>
                  ))}
                
                {/* Show expiring license */}
                {licenseAlerts
                  .filter(alert => !alert.isExpired)
                  .slice(0, 3)
                  .map((vehicle, index) => (
                    <div key={`expiring-license-${vehicle.id || vehicle._id || index}`} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                      <div>
                        <div className="font-medium text-gray-900">{vehicle.vehicleNumber}</div>
                        <div className="text-sm text-gray-600">
                          License expiring in {vehicle.daysUntilExpiry} days
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${getExpiryUrgency(vehicle.daysUntilExpiry)}`}>
                        {vehicle.daysUntilExpiry > 0 ? `${vehicle.daysUntilExpiry} days` : 'Expired'}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
      
      {/* Report Generation Buttons */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Reports</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleDownloadReport('summary')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Vehicle Summary Report
          </button>
          <button
            onClick={() => handleDownloadReport('expiry')}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
          >
            <ClockIcon className="h-5 w-5 mr-2" />
            Expiry Alerts Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
