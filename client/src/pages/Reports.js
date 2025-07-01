import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/SimpleAuthContext';
import { vehicleService } from '../services/vehicleService';
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
  const { hasPermission } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    maintenanceVehicles: 0,
    expiredDocuments: 0,
    expiringDocuments: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await vehicleService.getVehicleStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (reportType) => {
    if (!hasPermission('reports.export')) {
      toast.error('You do not have permission to export reports');
      return;
    }

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
        case 'maintenance':
          await reportService.downloadMaintenanceReport();
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
      description: 'Comprehensive overview of all vehicles including status, maintenance, and document expiry information.',
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
    },
    {
      id: 'maintenance',
      title: 'Maintenance Report',
      description: 'Maintenance history and scheduled maintenance for all vehicles.',
      icon: WrenchScrewdriverIcon,
      color: 'bg-green-500',
      permission: 'reports.export'
    }
  ];

  if (!hasPermission('reports.view')) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You do not have permission to view reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-2">Generate and download various reports for your vehicle fleet</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/vehicles')}
          title="View all vehicles"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <TruckIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <div className="h-6 w-6 bg-green-600 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.available || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <div className="h-6 w-6 bg-yellow-600 rounded-full"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Use</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inUse || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <WrenchScrewdriverIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.maintenance || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <ClockIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">{stats.expiringSoon || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <ChartBarIcon className="h-6 w-6 mr-2" />
            Available Reports
          </h2>
          <p className="text-gray-600 mt-1">Click on any report to download it as a PDF</p>
        </div>
        
        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner />
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportCards.map((report) => {
              const canDownload = hasPermission(report.permission);
              const IconComponent = report.icon;
              
              return (
                <div
                  key={report.id}
                  className={`border rounded-lg p-6 transition-all duration-200 ${
                    canDownload 
                      ? 'border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer' 
                      : 'border-gray-100 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => canDownload && !loading && handleDownloadReport(report.id)}
                >
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg ${report.color} flex-shrink-0`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {report.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          canDownload ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {canDownload ? 'Click to download' : 'No permission'}
                        </span>
                        {canDownload && (
                          <DocumentArrowDownIcon className="h-5 w-5 text-blue-600" />
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
      <div className="mt-8 bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Scheduled Reports</h2>
          <p className="text-gray-600 mt-1">Automated report generation (Coming Soon)</p>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">
              Schedule automatic report generation and email delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
