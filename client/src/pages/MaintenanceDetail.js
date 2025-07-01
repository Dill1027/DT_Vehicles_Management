import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/SimpleAuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  CheckCircleIcon,
  XCircleIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Mock maintenance service - replace with actual service
const maintenanceService = {
  getMaintenanceById: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            _id: id,
            vehicle: { _id: 'v1', vehicleNumber: 'DT-001', make: 'Toyota', model: 'Camry' },
            type: 'Scheduled',
            category: 'Oil Change',
            description: 'Regular oil change and filter replacement',
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            completedDate: null,
            status: 'Scheduled',
            priority: 'Medium',
            assignedMechanic: 'John Smith',
            cost: { 
              labor: 80,
              parts: 45,
              other: 25,
              total: 150
            },
            mileageAtService: 45000,
            workPerformed: '',
            notes: 'Vehicle is due for regular maintenance',
            attachments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        });
      }, 1000);
    });
  }
};

const MaintenanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [maintenance, setMaintenance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenanceDetail();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMaintenanceDetail = async () => {
    try {
      setLoading(true);
      const response = await maintenanceService.getMaintenanceById(id);
      setMaintenance(response.data);
    } catch (error) {
      console.error('Error fetching maintenance details:', error);
      toast.error('Failed to fetch maintenance details');
      navigate('/maintenance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!maintenance) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Maintenance record not found</h3>
        <button
          onClick={() => navigate('/maintenance')}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to maintenance
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/maintenance')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back to Maintenance
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {maintenance.description}
            </h1>
            <p className="text-gray-600">
              {maintenance.vehicle?.vehicleNumber} - {maintenance.vehicle?.make} {maintenance.vehicle?.model}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {hasPermission('edit_maintenance') && (
            <button
              onClick={() => navigate(`/maintenance/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
          )}
          {maintenance.status !== 'Completed' && hasPermission('complete_maintenance') && (
            <button
              onClick={() => {/* Handle complete action */}}
              className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-md hover:bg-green-50"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Mark Complete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Maintenance Details</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-700">Type</div>
                <p className="text-gray-900">{maintenance.type}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Category</div>
                <p className="text-gray-900">{maintenance.category}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Status</div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(maintenance.status)}`}>
                  {maintenance.status}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Priority</div>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(maintenance.priority)}`}>
                  {maintenance.priority}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Scheduled Date</div>
                <p className="text-gray-900">{formatDate(maintenance.scheduledDate)}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Completed Date</div>
                <p className="text-gray-900">{formatDate(maintenance.completedDate)}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Assigned Mechanic</div>
                <p className="text-gray-900">{maintenance.assignedMechanic || 'Unassigned'}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Mileage</div>
                <p className="text-gray-900">
                  {maintenance.mileageAtService ? `${maintenance.mileageAtService.toLocaleString()} km` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700">Description</div>
              <p className="text-gray-900 mt-1">{maintenance.description}</p>
            </div>

            {maintenance.workPerformed && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700">Work Performed</div>
                <p className="text-gray-900 mt-1">{maintenance.workPerformed}</p>
              </div>
            )}

            {maintenance.notes && (
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700">Notes</div>
                <p className="text-gray-900 mt-1">{maintenance.notes}</p>
              </div>
            )}
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cost Breakdown</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Labor Cost</span>
                <span className="font-medium">${maintenance.cost?.labor || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Parts Cost</span>
                <span className="font-medium">${maintenance.cost?.parts || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Other Costs</span>
                <span className="font-medium">${maintenance.cost?.other || 0}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Cost</span>
                  <span>${maintenance.cost?.total || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Vehicle Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-700">Vehicle Number</div>
                <p className="text-gray-900">{maintenance.vehicle?.vehicleNumber}</p>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700">Make & Model</div>
                <p className="text-gray-900">
                  {maintenance.vehicle?.make} {maintenance.vehicle?.model}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate(`/vehicles/${maintenance.vehicle?._id}`)}
              className="mt-4 w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
            >
              View Vehicle Details
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="space-y-3">
              {maintenance.status !== 'Completed' && hasPermission('complete_maintenance') && (
                <button
                  onClick={() => {/* Handle complete action */}}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Mark as Completed
                </button>
              )}
              
              {maintenance.status === 'Scheduled' && hasPermission('start_maintenance') && (
                <button
                  onClick={() => {/* Handle start action */}}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <WrenchScrewdriverIcon className="h-4 w-4" />
                  Start Maintenance
                </button>
              )}
              
              {maintenance.status !== 'Cancelled' && hasPermission('cancel_maintenance') && (
                <button
                  onClick={() => {/* Handle cancel action */}}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <XCircleIcon className="h-4 w-4" />
                  Cancel Maintenance
                </button>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-xs text-gray-500">{formatDateTime(maintenance.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Scheduled</p>
                  <p className="text-xs text-gray-500">{formatDateTime(maintenance.scheduledDate)}</p>
                </div>
              </div>
              
              {maintenance.completedDate && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Completed</p>
                    <p className="text-xs text-gray-500">{formatDateTime(maintenance.completedDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetail;
