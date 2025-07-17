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
    
    // Cache dashboard data and set up intelligent refresh
    const cacheKey = 'dashboard_data_cache';
    const cacheTime = 2 * 60 * 1000; // 2 minutes cache
    
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    
    if (cachedData && cacheTimestamp && 
        (Date.now() - parseInt(cacheTimestamp) < cacheTime)) {
      // Use cached data if available and fresh
      try {
        const parsed = JSON.parse(cachedData);
        setVehicles(parsed.vehicles || []);
        setStats(parsed.stats || {});
        setInsuranceAlerts(parsed.insuranceAlerts || []);
        setLicenseAlerts(parsed.licenseAlerts || []);
        setLoading(false);
        
        // Still fetch fresh data in background but don't show loading
        fetchDashboardData(false);
        return;
      } catch (e) {
        console.warn('Cache parse error:', e);
      }
    }
  }, []);

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      // Fetch all data in parallel with timeout
      const fetchPromises = [
        vehicleService.getAllVehicles({ limit: 10 }),
        vehicleService.getVehicleStats(),
        notificationService.getInsuranceExpiryAlerts(30),
        notificationService.getLicenseExpiryAlerts(30)
      ];
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const [
        vehiclesResponse,
        statsResponse,
        insuranceAlertsResponse,
        licenseAlertsResponse
      ] = await Promise.race([
        Promise.all(fetchPromises),
        timeoutPromise
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

      // Cache the dashboard data to improve subsequent loads
      const cacheData = {
        vehicles: vehiclesArray,
        stats: {
          total: statsData.total || 0,
          available: statsData.available || 0,
          inUse: statsData.inUse || 0,
          maintenance: statsData.maintenance || 0,
          insuranceExpiring: expiringInsurance.length,
          insuranceExpired: expiredInsurance.length,
          licenseExpiring: expiringLicense.length,
          licenseExpired: expiredLicense.length
        },
        insuranceAlerts,
        licenseAlerts
      };
      
      try {
        localStorage.setItem('dashboard_data_cache', JSON.stringify(cacheData));
        localStorage.setItem('dashboard_data_cache_timestamp', Date.now().toString());
      } catch (e) {
        console.warn('Failed to cache dashboard data:', e);
      }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
            Welcome to Vehicle Management!
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">Deep Tec Engineering Vehicle Management Dashboard</p>
          <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
      </div>
      
      {/* Active Filter Banner */}
      {activeFilter !== 'all' && (
        <div className={`p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-2 shadow-lg border-2 backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
          activeFilter === 'insurance' ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300' : 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-300'
        }`}>
          <div className="flex items-center text-center sm:text-left">
            <BellIcon className={`h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 animate-pulse flex-shrink-0 ${
              activeFilter === 'insurance' ? 'text-blue-600' : 'text-purple-600'
            }`} />
            <span className={`font-semibold text-sm sm:text-base md:text-lg ${
              activeFilter === 'insurance' ? 'text-blue-800' : 'text-purple-800'
            }`}>
              Showing {activeFilter === 'insurance' ? 'Insurance' : 'License'} Expiry Alerts Only
            </span>
          </div>
          <button 
            onClick={() => setActiveFilter('all')} 
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex-shrink-0 ${
              activeFilter === 'insurance' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700' 
                : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filter
          </button>
        </div>
      )}
      
      {/* Stats Cards - Enhanced Mobile Responsiveness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Link to="/vehicles" className="group bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 block hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-blue-300 bg-gradient-to-br from-white to-blue-50">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300 shadow-md flex-shrink-0">
              <TruckIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 group-hover:text-gray-600 transition-colors leading-tight">Total Vehicles</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors">{stats.total}</p>
            </div>
          </div>
        </Link>
        
        <div className="group bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-green-300 bg-gradient-to-br from-white to-green-50">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-green-100 to-green-200 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 shadow-md flex-shrink-0">
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-sm"></div>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 group-hover:text-gray-600 transition-colors leading-tight">Available</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600 group-hover:text-green-700 transition-colors">{stats.available}</p>
            </div>
          </div>
        </div>
        
        <div className="group bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-yellow-300 bg-gradient-to-br from-white to-yellow-50">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 group-hover:from-yellow-200 group-hover:to-yellow-300 transition-all duration-300 shadow-md flex-shrink-0">
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full shadow-sm"></div>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 group-hover:text-gray-600 transition-colors leading-tight">In Use</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600 group-hover:text-yellow-700 transition-colors">{stats.inUse}</p>
            </div>
          </div>
        </div>
        
        <div className="group bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-red-300 bg-gradient-to-br from-white to-red-50">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-red-100 to-red-200 group-hover:from-red-200 group-hover:to-red-300 transition-all duration-300 shadow-md flex-shrink-0">
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-sm"></div>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 group-hover:text-gray-600 transition-colors leading-tight">In Maintenance</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 group-hover:text-red-700 transition-colors">{stats.maintenance}</p>
            </div>
          </div>
        </div>
        
        <div className="group bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-orange-300 bg-gradient-to-br from-white to-orange-50">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300 shadow-md flex-shrink-0">
              <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 group-hover:text-gray-600 transition-colors leading-tight">Insurance Expiring Soon</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors">{stats.insuranceExpiring}</p>
            </div>
          </div>
        </div>
        
        <div className="group bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-red-300 bg-gradient-to-br from-white to-red-50">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-red-100 to-red-200 group-hover:from-red-200 group-hover:to-red-300 transition-all duration-300 shadow-md flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 group-hover:text-gray-600 transition-colors leading-tight">Insurance Expired</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600 group-hover:text-red-700 transition-colors">{stats.insuranceExpired}</p>
            </div>
          </div>
        </div>
        
        <div className="group bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-purple-300 bg-gradient-to-br from-white to-purple-50">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 shadow-md flex-shrink-0">
              <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 group-hover:text-gray-600 transition-colors leading-tight">License Expiring Soon</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 group-hover:text-purple-700 transition-colors">{stats.licenseExpiring}</p>
            </div>
          </div>
        </div>
        
        <div className="group bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-2xl hover:scale-105 transition-all duration-300 hover:border-pink-300 bg-gradient-to-br from-white to-pink-50">
          <div className="flex items-center">
            <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 group-hover:from-pink-200 group-hover:to-pink-300 transition-all duration-300 shadow-md flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-pink-600" />
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-500 group-hover:text-gray-600 transition-colors leading-tight">License Expired</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-pink-600 group-hover:text-pink-700 transition-colors">{stats.licenseExpired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Cards - Mobile Enhanced */}
      {insuranceAlerts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Expired Insurance Alert */}
          {insuranceAlerts.filter(alert => alert.isExpired).length > 0 && (
            <button 
              className="group bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 sm:p-6 cursor-pointer hover:shadow-xl hover:shadow-red-200/50 hover:bg-gradient-to-br hover:from-red-100 hover:to-red-200 transition-all duration-300 transform hover:scale-105 shadow-lg w-full text-left"
              onClick={() => handleFilterClick('insurance')}
              aria-label="Filter by expired insurance"
            >
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-red-200 to-red-300 group-hover:from-red-300 group-hover:to-red-400 transition-all duration-300 shadow-md flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-700" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-red-800 group-hover:text-red-900 transition-colors leading-tight">
                    {insuranceAlerts.filter(alert => alert.isExpired).length} Expired Insurance
                  </h3>
                  <p className="text-sm sm:text-base text-red-700 group-hover:text-red-800 transition-colors font-medium">Immediate attention required</p>
                </div>
              </div>
            </button>
          )}

          {/* Expiring Soon Insurance Alert */}
          {insuranceAlerts.filter(alert => !alert.isExpired).length > 0 && (
            <button 
              className="group bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-200 rounded-xl p-4 sm:p-6 cursor-pointer hover:shadow-xl hover:shadow-yellow-200/50 hover:bg-gradient-to-br hover:from-yellow-100 hover:to-amber-200 transition-all duration-300 transform hover:scale-105 shadow-lg w-full text-left"
              onClick={() => handleFilterClick('insurance')}
              aria-label="Filter by insurance expiring soon"
            >
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 group-hover:from-yellow-300 group-hover:to-amber-400 transition-all duration-300 shadow-md flex-shrink-0">
                  <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-700" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-yellow-800 group-hover:text-yellow-900 transition-colors leading-tight">
                    {insuranceAlerts.filter(alert => !alert.isExpired).length} Insurance Expiring Soon
                  </h3>
                  <p className="text-sm sm:text-base text-yellow-700 group-hover:text-yellow-800 transition-colors font-medium">Click to view details</p>
                </div>
              </div>
            </button>
          )}
        </div>
      )}

      {/* Alert Cards for License - Mobile Enhanced */}
      {licenseAlerts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Expired License Alert */}
          {licenseAlerts.filter(alert => alert.isExpired).length > 0 && (
            <button 
              className="group bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 sm:p-6 cursor-pointer hover:shadow-xl hover:shadow-red-200/50 hover:bg-gradient-to-br hover:from-red-100 hover:to-red-200 transition-all duration-300 transform hover:scale-105 shadow-lg w-full text-left"
              onClick={() => handleFilterClick('license')}
              aria-label="Filter by expired license"
            >
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-red-200 to-red-300 group-hover:from-red-300 group-hover:to-red-400 transition-all duration-300 shadow-md flex-shrink-0">
                  <ExclamationTriangleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-700" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-red-800 group-hover:text-red-900 transition-colors leading-tight">
                    {licenseAlerts.filter(alert => alert.isExpired).length} Expired License
                  </h3>
                  <p className="text-sm sm:text-base text-red-700 group-hover:text-red-800 transition-colors font-medium">Immediate attention required</p>
                </div>
              </div>
            </button>
          )}

          {/* Expiring Soon License Alert */}
          {licenseAlerts.filter(alert => !alert.isExpired).length > 0 && (
            <button 
              className="group bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-200 rounded-xl p-4 sm:p-6 cursor-pointer hover:shadow-xl hover:shadow-yellow-200/50 hover:bg-gradient-to-br hover:from-yellow-100 hover:to-amber-200 transition-all duration-300 transform hover:scale-105 shadow-lg w-full text-left"
              onClick={() => handleFilterClick('license')}
              aria-label="Filter by license expiring soon"
            >
              <div className="flex items-center">
                <div className="p-2 sm:p-3 rounded-full bg-gradient-to-br from-yellow-200 to-amber-300 group-hover:from-yellow-300 group-hover:to-amber-400 transition-all duration-300 shadow-md flex-shrink-0">
                  <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-700" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-yellow-800 group-hover:text-yellow-900 transition-colors leading-tight">
                    {licenseAlerts.filter(alert => !alert.isExpired).length} License Expiring Soon
                  </h3>
                  <p className="text-sm sm:text-base text-yellow-700 group-hover:text-yellow-800 transition-colors font-medium">Click to view details</p>
                </div>
              </div>
            </button>
          )}

          {/* Expiring Soon License Alert */}
          {licenseAlerts.filter(alert => !alert.isExpired).length > 0 && (
            <div 
              className="group bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 cursor-pointer hover:shadow-xl hover:shadow-purple-200/50 hover:bg-gradient-to-br hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => handleFilterClick('license')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleFilterClick('license')}
              aria-label="Filter by license expiring soon"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 group-hover:from-purple-300 group-hover:to-purple-400 transition-all duration-300 shadow-md">
                  <ClockIcon className="h-8 w-8 text-purple-700 flex-shrink-0" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-purple-800 group-hover:text-purple-900 transition-colors">
                    {licenseAlerts.filter(alert => !alert.isExpired).length} License Expiring Soon
                  </h3>
                  <p className="text-purple-700 group-hover:text-purple-800 transition-colors font-medium">Click to view details</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Recent Vehicles */}
        {activeFilter === 'all' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Recent Vehicles</h2>
                <Link 
                  to="/vehicles" 
                  className="group inline-flex items-center px-4 py-2 text-blue-600 hover:text-white font-semibold rounded-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-md"
                >
                  View All
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          <div className="overflow-x-auto bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(vehicles) && vehicles.length > 0 ? (
                  vehicles.slice(0, 5).map((vehicle, index) => (
                    <tr key={vehicle.id || vehicle._id || index} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {vehicle.vehicleNumber}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {vehicle.make} {vehicle.model}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                        {vehicle.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500 font-medium">
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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Insurance Expiry Alerts</h2>
                {activeFilter === 'insurance' && (
                  <button 
                    onClick={() => setActiveFilter('all')} 
                    className="group inline-flex items-center px-4 py-2 text-orange-600 hover:text-white font-semibold rounded-lg hover:bg-gradient-to-r hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    <span className="mr-2">Show All</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                {activeFilter === 'all' && (
                  <div className="p-2 rounded-full bg-gradient-to-br from-orange-100 to-red-200 shadow-md">
                    <BellIcon className="h-6 w-6 text-orange-600" />
                  </div>
                )}
              </div>
            </div>
          <div className="p-6 bg-gradient-to-br from-white to-gray-50">
            {insuranceAlerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 rounded-full bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No insurance expiry alerts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show expired insurance first */}
                {insuranceAlerts
                  .filter(alert => alert.isExpired)
                  .slice(0, 3)
                  .map((vehicle, index) => (
                    <div key={`expired-insurance-${vehicle.id || vehicle._id || index}`} className="group flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl hover:from-red-100 hover:to-red-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-red-200">
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{vehicle.vehicleNumber}</div>
                        <div className="text-sm text-red-700 font-medium">
                          Insurance - Expired {Math.abs(vehicle.daysUntilExpiry)} days ago
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-sm rounded-full shadow-md group-hover:shadow-lg">EXPIRED</span>
                    </div>
                  ))}
                
                {/* Show expiring insurance */}
                {insuranceAlerts
                  .filter(alert => !alert.isExpired)
                  .slice(0, 3)
                  .map((vehicle, index) => (
                    <div key={`expiring-insurance-${vehicle.id || vehicle._id || index}`} className="group flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-amber-100 rounded-xl hover:from-yellow-100 hover:to-amber-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-yellow-200">
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{vehicle.vehicleNumber}</div>
                        <div className="text-sm text-gray-700 font-medium">
                          Insurance expiring in {vehicle.daysUntilExpiry} days
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-sm font-bold rounded-full shadow-md group-hover:shadow-lg ${getExpiryUrgency(vehicle.daysUntilExpiry)}`}>
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
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">License Expiry Alerts</h2>
                {activeFilter === 'license' && (
                  <button 
                    onClick={() => setActiveFilter('all')} 
                    className="group inline-flex items-center px-4 py-2 text-purple-600 hover:text-white font-semibold rounded-lg hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 hover:shadow-md"
                  >
                    <span className="mr-2">Show All</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                {activeFilter === 'all' && (
                  <div className="p-2 rounded-full bg-gradient-to-br from-purple-100 to-pink-200 shadow-md">
                    <BellIcon className="h-6 w-6 text-purple-600" />
                  </div>
                )}
              </div>
            </div>
          <div className="p-6 bg-gradient-to-br from-white to-gray-50">
            {licenseAlerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 rounded-full bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-gray-500 font-medium">No license expiry alerts</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Show expired license first */}
                {licenseAlerts
                  .filter(alert => alert.isExpired)
                  .slice(0, 3)
                  .map((vehicle, index) => (
                    <div key={`expired-license-${vehicle.id || vehicle._id || index}`} className="group flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl hover:from-red-100 hover:to-red-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-red-200">
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{vehicle.vehicleNumber}</div>
                        <div className="text-sm text-red-700 font-medium">
                          License - Expired {Math.abs(vehicle.daysUntilExpiry)} days ago
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-sm rounded-full shadow-md group-hover:shadow-lg">EXPIRED</span>
                    </div>
                  ))}
                
                {/* Show expiring license */}
                {licenseAlerts
                  .filter(alert => !alert.isExpired)
                  .slice(0, 3)
                  .map((vehicle, index) => (
                    <div key={`expiring-license-${vehicle.id || vehicle._id || index}`} className="group flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-purple-200">
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{vehicle.vehicleNumber}</div>
                        <div className="text-sm text-gray-700 font-medium">
                          License expiring in {vehicle.daysUntilExpiry} days
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-sm font-bold rounded-full shadow-md group-hover:shadow-lg ${getExpiryUrgency(vehicle.daysUntilExpiry)}`}>
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
      <div className="mt-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Generate Reports</h2>
          <p className="text-gray-600 font-medium">Download comprehensive vehicle reports</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <button
            onClick={() => handleDownloadReport('summary')}
            className="group flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
          >
            <DocumentArrowDownIcon className="h-6 w-6 mr-3 group-hover:animate-bounce" />
            Vehicle Summary Report
          </button>
          <button
            onClick={() => handleDownloadReport('expiry')}
            className="group flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
          >
            <ClockIcon className="h-6 w-6 mr-3 group-hover:animate-pulse" />
            Expiry Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
