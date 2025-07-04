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
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    inUse: 0,
    insuranceExpiring: 0,
    insuranceExpired: 0
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
        insuranceAlertsResponse
      ] = await Promise.all([
        vehicleService.getAllVehicles({ limit: 10 }),
        vehicleService.getVehicleStats(),
        notificationService.getInsuranceExpiryAlerts(30)
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
      const expiredInsurance = insuranceAlerts.filter(alert => alert.isExpired);
      const expiringInsurance = insuranceAlerts.filter(alert => !alert.isExpired);
      
      setStats({
        total: statsData.total || 0,
        available: statsData.available || 0,
        inUse: statsData.inUse || 0,
        insuranceExpiring: expiringInsurance.length,
        insuranceExpired: expiredInsurance.length
      });
      
      setInsuranceAlerts(insuranceAlerts);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to Vehicle Management!
          </h1>
          <p className="text-gray-600">Deep Tec Engineering Vehicle Management Dashboard</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleDownloadReport('summary')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Vehicle Report
          </button>
          <button
            onClick={() => handleDownloadReport('expiry')}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <ClockIcon className="h-5 w-5 mr-2" />
            Expiry Report
          </button>
        </div>
      </div>

      {/* Alert Cards */}
      {insuranceAlerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Expired Insurance Alert */}
          {insuranceAlerts.filter(alert => alert.isExpired).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">
                    {insuranceAlerts.filter(alert => !alert.isExpired).length} Insurance Expiring Soon
                  </h3>
                  <p className="text-yellow-700"></p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link to="/vehicles" className="bg-white p-6 rounded-lg shadow-md block hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <TruckIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Vehicles</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </Link>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <div className="h-4 w-4 bg-green-600 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Available</h3>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">In Use</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.inUse}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Insurance Expiring</h3>
              <p className="text-2xl font-bold text-orange-600">{stats.insuranceExpiring}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Insurance Expired</h3>
              <p className="text-2xl font-bold text-red-600">{stats.insuranceExpired}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vehicles */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Vehicles</h2>
            <Link 
              to="/vehicles" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(vehicles) && vehicles.length > 0 ? (
                  vehicles.slice(0, 5).map((vehicle, index) => (
                    <tr key={vehicle.id || vehicle._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {vehicle.vehicleNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vehicle.make} {vehicle.model}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      No vehicles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insurance Expiry Alerts */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Insurance Expiry Alerts</h2>
            <BellIcon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="p-6">
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
                    <div key={`expired-insurance-${vehicle.id || vehicle._id || index}`} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
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
                    <div key={`expiring-insurance-${vehicle.id || vehicle._id || index}`} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
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
      </div>
    </div>
  );
};

export default Dashboard;
