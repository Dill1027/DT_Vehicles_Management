import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/vehicleService';
import notificationService from '../services/notificationService';
import reportService from '../services/reportService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  DocumentArrowDownIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Reports = () => {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    maintenanceVehicles: 0,
    total: 0,
    available: 0,
    inUse: 0,
    maintenance: 0,
    insuranceExpiring: 0,
    insuranceExpired: 0,
    licenseExpiring: 0,
    licenseExpired: 0,
    expiringSoon: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel like Dashboard does
      const [
        statsResponse,
        insuranceAlertsResponse,
        licenseAlertsResponse
      ] = await Promise.all([
        vehicleService.getVehicleStats(),
        notificationService.getInsuranceExpiryAlerts(30),
        notificationService.getLicenseExpiryAlerts(30)
      ]);
      
      const statsData = statsResponse.data || {};
      const insuranceAlerts = insuranceAlertsResponse.data || [];
      const licenseAlerts = licenseAlertsResponse.data || [];
      
      // Calculate expired and expiring counts like Dashboard
      const expiredInsurance = insuranceAlerts.filter(alert => alert.isExpired);
      const expiringInsurance = insuranceAlerts.filter(alert => !alert.isExpired);
      
      const expiredLicense = licenseAlerts.filter(alert => alert.isExpired);
      const expiringLicense = licenseAlerts.filter(alert => !alert.isExpired);
      
      // Debug logging
      console.log('📊 Reports Page Data:', {
        statsData,
        insuranceAlertsCount: insuranceAlerts.length,
        licenseAlertsCount: licenseAlerts.length,
        expiredInsurance: expiredInsurance.length,
        expiringInsurance: expiringInsurance.length,
        expiredLicense: expiredLicense.length,
        expiringLicense: expiringLicense.length
      });
      
      setStats({
        total: statsData.total || 0,
        available: statsData.available || 0,
        inUse: statsData.inUse || 0,
        maintenance: statsData.maintenance || 0,
        insuranceExpiring: expiringInsurance.length,
        insuranceExpired: expiredInsurance.length,
        licenseExpiring: expiringLicense.length,
        licenseExpired: expiredLicense.length,
        expiringSoon: expiringInsurance.length + expiringLicense.length,
        // Legacy compatibility
        totalVehicles: statsData.total || 0,
        activeVehicles: statsData.available || 0,
        maintenanceVehicles: statsData.maintenance || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportType) => {
    try {
      setLoading(true);
      toast.loading('Generating report...');

      switch (reportType) {
        case 'vehicle-summary':
          await reportService.downloadVehicleSummaryReport();
          break;
        case 'expiry-alerts':
          await reportService.downloadExpiryAlertsReport(30);
          break;
        default:
          throw new Error('Unknown report type');
      }

      toast.dismiss();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.dismiss();
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const reportCards = [
    {
      id: 'vehicle-summary',
      title: 'Vehicle Summary Report',
      description: 'Comprehensive overview of all vehicles including status and document expiry information.',
      icon: TruckIcon,
      color: 'bg-blue-500',
      permission: 'reports.export'
    },
    {
      id: 'expiry-alerts',
      title: 'Document Expiry Report',
      description: 'List of vehicles with expired or expiring documents (insurance, emissions, revenue license).',
      icon: ExclamationTriangleIcon,
      color: 'bg-orange-500',
      permission: 'reports.export'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Reports & Analytics
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Comprehensive vehicle fleet statistics including expired and expiring documents, plus downloadable reports
        </p>
        <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div
          className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-blue-300"
          onClick={() => navigate('/vehicles')}
          title="View all vehicles"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-green-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-green-100 to-green-200 shadow-sm">
              <div className="h-6 w-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-sm"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.available || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-yellow-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 shadow-sm">
              <div className="h-6 w-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full shadow-sm"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Use</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inUse || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-red-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-red-100 to-red-200 shadow-sm">
              <WrenchScrewdriverIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.maintenance || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-orange-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 shadow-sm">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">{stats.expiringSoon || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-red-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-red-100 to-red-200 shadow-sm">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expired Docs</p>
              <p className="text-2xl font-bold text-gray-900">{(stats.insuranceExpired || 0) + (stats.licenseExpired || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Expiry Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-orange-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 shadow-sm">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Insurance Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">{stats.insuranceExpiring || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-red-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-red-100 to-red-200 shadow-sm">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Insurance Expired</p>
              <p className="text-2xl font-bold text-gray-900">{stats.insuranceExpired || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-orange-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 shadow-sm">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">License Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">{stats.licenseExpiring || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-red-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gradient-to-br from-red-100 to-red-200 shadow-sm">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">License Expired</p>
              <p className="text-2xl font-bold text-gray-900">{stats.licenseExpired || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white mr-3 shadow-sm">
              <ChartBarIcon className="h-6 w-6" />
            </div>
            Available Reports
          </h2>
          <p className="text-gray-600 mt-2 text-lg">Click on any report to download it as a professional PDF</p>
        </div>
        
        <div className="p-8">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600 font-medium">Generating your report...</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {reportCards.map((report) => {
              const IconComponent = report.icon;
              
              return (
                <div
                  key={report.id}
                  className={`group border-2 rounded-xl p-8 transition-all duration-300 transform ${
                    true 
                      ? 'border-gray-200 hover:border-blue-300 hover:shadow-xl hover:scale-105 cursor-pointer bg-gradient-to-br from-white to-gray-50' 
                      : 'border-gray-100 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => true && !loading && handleDownloadReport(report.id)}
                >
                  <div className="flex items-start">
                    <div className={`p-4 rounded-xl ${report.color} flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-6 flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                        {report.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {report.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 group-hover:bg-blue-200 transition-colors duration-300">
                          <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                          Download PDF
                        </span>
                        {true && (
                          <div className="p-2 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors duration-300">
                            <DocumentArrowDownIcon className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Report Schedule (Future Enhancement) */}
      <div className="mt-8 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-lg border border-purple-100">
        <div className="p-8 border-b border-purple-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white mr-3 shadow-sm">
              <ClockIcon className="h-6 w-6" />
            </div>
            Scheduled Reports
          </h2>
          <p className="text-gray-600 mt-2 text-lg">Automated report generation (Coming Soon)</p>
        </div>
        <div className="p-8">
          <div className="text-center py-12">
            <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 mb-6 shadow-lg">
              <ClockIcon className="h-16 w-16 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Exciting Features Coming Soon!</h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
              Schedule automatic report generation and email delivery to stay informed about your fleet status
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <div className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-full font-medium shadow-lg">
                Auto-Generated Reports
              </div>
              <div className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-600 text-white rounded-full font-medium shadow-lg">
                Email Notifications
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
