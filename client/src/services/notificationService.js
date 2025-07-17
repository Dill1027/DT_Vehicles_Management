import { vehicleService } from './vehicleService';
import api from './api';

const notificationService = {
  // Get vehicles with expiring insurance
  getInsuranceExpiryAlerts: async (days = 30) => {
    try {
      // Always fetch from vehicles API to ensure we get all vehicles including expired ones
      console.log('🔍 Fetching insurance alerts - checking both backend API and vehicles API...');
      
      let finalData = [];
      
      // Try backend API first
      try {
        const backendResponse = await api.get(`/notifications/insurance-expiry?days=${days}`);
        let backendData = backendResponse.data.data || backendResponse.data;
        
        if (Array.isArray(backendData) && backendData.length > 0) {
          // Fix any missing isExpired fields
          backendData = backendData.map(item => {
            const today = new Date();
            const expiryDate = new Date(item.insuranceExpiry);
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            return {
              ...item,
              daysUntilExpiry: daysUntilExpiry,
              isExpired: daysUntilExpiry <= 0
            };
          });
          
          console.log('✅ Backend API returned', backendData.length, 'insurance alerts');
          finalData = [...backendData];
        }
      } catch (apiError) {
        console.log('⚠️ Backend API failed:', apiError.message);
      }
      
      // ALWAYS also check vehicles API to ensure we don't miss expired vehicles
      try {
        const vehiclesResult = await vehicleService.getAllVehicles({ limit: 1000 });
        let vehicles = [];
        
        if (vehiclesResult?.data?.data) {
          vehicles = vehiclesResult.data.data;
        } else if (vehiclesResult?.data) {
          vehicles = vehiclesResult.data;
        } else if (Array.isArray(vehiclesResult)) {
          vehicles = vehiclesResult;
        }
        
        console.log('🔍 Processing', vehicles.length, 'vehicles for insurance expiry');
        
        const vehicleInsuranceAlerts = [];
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        vehicles.forEach(vehicle => {
          if (vehicle.insuranceExpiry) {
            const expiryDate = new Date(vehicle.insuranceExpiry);
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            // Include vehicles that are expired OR expiring within the specified days
            if (daysUntilExpiry <= days) {
              let urgencyLevel = 'info';
              if (daysUntilExpiry <= 0) {
                urgencyLevel = 'expired';
              } else if (daysUntilExpiry <= 7) {
                urgencyLevel = 'critical';
              } else if (daysUntilExpiry <= 15) {
                urgencyLevel = 'warning';
              }
              
              vehicleInsuranceAlerts.push({
                ...vehicle,
                insuranceExpiryDate: vehicle.insuranceExpiry,
                daysUntilExpiry,
                isExpired: daysUntilExpiry <= 0,
                urgencyLevel
              });
              
              console.log(`🚗 Vehicle ${vehicle.vehicleNumber}: Insurance ${daysUntilExpiry > 0 ? 'expires in ' + daysUntilExpiry + ' days' : 'expired ' + Math.abs(daysUntilExpiry) + ' days ago'}`);
            }
          }
        });
        
        // Merge with backend data, removing duplicates (prefer vehicles API data)
        const vehicleNumbers = new Set(vehicleInsuranceAlerts.map(v => v.vehicleNumber));
        const backendOnly = finalData.filter(item => !vehicleNumbers.has(item.vehicleNumber));
        
        finalData = [...vehicleInsuranceAlerts, ...backendOnly];
        
        console.log('📊 Final insurance alerts:', {
          fromVehiclesAPI: vehicleInsuranceAlerts.length,
          fromBackendOnly: backendOnly.length,
          total: finalData.length,
          expired: finalData.filter(a => a.isExpired).length,
          expiring: finalData.filter(a => !a.isExpired).length
        });
        
      } catch (vehicleError) {
        console.error('❌ Vehicles API failed:', vehicleError.message);
      }
      
      // Sort by urgency (expired first, then by days remaining)
      finalData.sort((a, b) => {
        if (a.isExpired && !b.isExpired) return -1;
        if (!a.isExpired && b.isExpired) return 1;
        return a.daysUntilExpiry - b.daysUntilExpiry;
      });

      return { success: true, data: finalData };
    } catch (error) {
      console.error('❌ Error fetching insurance expiry alerts:', error);
      return { success: false, data: [] };
    }
  },

  // Get vehicles with expiring licenses
  getLicenseExpiryAlerts: async (days = 30) => {
    try {
      // Always fetch from vehicles API to ensure we get all vehicles including expired ones
      console.log('🔍 Fetching license alerts - checking both backend API and vehicles API...');
      
      let finalData = [];
      
      // Try backend API first
      try {
        const backendResponse = await api.get(`/notifications/license-expiry?days=${days}`);
        let backendData = backendResponse.data.data || backendResponse.data;
        
        if (Array.isArray(backendData) && backendData.length > 0) {
          // Fix any missing isExpired fields
          backendData = backendData.map(item => {
            const today = new Date();
            const expiryDate = new Date(item.licenseExpiry);
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            return {
              ...item,
              daysUntilExpiry: daysUntilExpiry,
              isExpired: daysUntilExpiry <= 0
            };
          });
          
          console.log('✅ Backend API returned', backendData.length, 'license alerts');
          finalData = [...backendData];
        }
      } catch (apiError) {
        console.log('⚠️ Backend API failed:', apiError.message);
      }
      
      // ALWAYS also check vehicles API to ensure we don't miss expired vehicles
      try {
        const vehiclesResult = await vehicleService.getAllVehicles({ limit: 1000 });
        let vehicles = [];
        
        if (vehiclesResult?.data?.data) {
          vehicles = vehiclesResult.data.data;
        } else if (vehiclesResult?.data) {
          vehicles = vehiclesResult.data;
        } else if (Array.isArray(vehiclesResult)) {
          vehicles = vehiclesResult;
        }
        
        console.log('🔍 Processing', vehicles.length, 'vehicles for license expiry');
        
        const vehicleLicenseAlerts = [];
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        vehicles.forEach(vehicle => {
          if (vehicle.licenseExpiry) {
            const expiryDate = new Date(vehicle.licenseExpiry);
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            // Include vehicles that are expired OR expiring within the specified days
            if (daysUntilExpiry <= days) {
              let urgencyLevel = 'info';
              if (daysUntilExpiry <= 0) {
                urgencyLevel = 'expired';
              } else if (daysUntilExpiry <= 7) {
                urgencyLevel = 'critical';
              } else if (daysUntilExpiry <= 15) {
                urgencyLevel = 'warning';
              }
              
              vehicleLicenseAlerts.push({
                ...vehicle,
                licenseExpiryDate: vehicle.licenseExpiry,
                daysUntilExpiry,
                isExpired: daysUntilExpiry <= 0,
                urgencyLevel
              });
              
              console.log(`🚗 Vehicle ${vehicle.vehicleNumber}: License ${daysUntilExpiry > 0 ? 'expires in ' + daysUntilExpiry + ' days' : 'expired ' + Math.abs(daysUntilExpiry) + ' days ago'}`);
            }
          }
        });
        
        // Merge with backend data, removing duplicates (prefer vehicles API data)
        const vehicleNumbers = new Set(vehicleLicenseAlerts.map(v => v.vehicleNumber));
        const backendOnly = finalData.filter(item => !vehicleNumbers.has(item.vehicleNumber));
        
        finalData = [...vehicleLicenseAlerts, ...backendOnly];
        
        console.log('📊 Final license alerts:', {
          fromVehiclesAPI: vehicleLicenseAlerts.length,
          fromBackendOnly: backendOnly.length,
          total: finalData.length,
          expired: finalData.filter(a => a.isExpired).length,
          expiring: finalData.filter(a => !a.isExpired).length
        });
        
      } catch (vehicleError) {
        console.error('❌ Vehicles API failed:', vehicleError.message);
      }
      
      // Sort by urgency (expired first, then by days remaining)
      finalData.sort((a, b) => {
        if (a.isExpired && !b.isExpired) return -1;
        if (!a.isExpired && b.isExpired) return 1;
        return a.daysUntilExpiry - b.daysUntilExpiry;
      });

      return { success: true, data: finalData };
    } catch (error) {
      console.error('❌ Error fetching license expiry alerts:', error);
      return { success: false, data: [] };
    }
  },  // Get expiring vehicles
  getExpiringVehicles: async (days = 30) => {
    try {
      // Try backend API first
      try {
        const response = await api.get(`/notifications/expiring?days=${days}`);
        return { success: true, data: response.data.data || response.data };
      } catch (apiError) {
        // Backend API not available, use vehicle service fallback
        console.log('Backend API not available, using vehicle service fallback...', apiError.message);
        
        // Fallback to vehicle service
        const vehiclesResult = await vehicleService.getAllVehicles();
        const vehicles = vehiclesResult.data || [];
        
        const currentDate = new Date();
        const expiringVehicles = [];
        
        vehicles.forEach(vehicle => {
          const expiringDocs = [];
          
          // Check insurance expiry
          if (vehicle.insuranceExpiry) {
            const expiryDate = new Date(vehicle.insuranceExpiry);
            const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= days && daysUntilExpiry > 0) {
              expiringDocs.push({ type: 'Insurance', expiryDate: vehicle.insuranceExpiry, daysUntilExpiry });
            }
          }
          
          // Check registration expiry
          if (vehicle.registrationExpiry) {
            const expiryDate = new Date(vehicle.registrationExpiry);
            const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry <= days && daysUntilExpiry > 0) {
              expiringDocs.push({ type: 'Registration', expiryDate: vehicle.registrationExpiry, daysUntilExpiry });
            }
          }
          
          if (expiringDocs.length > 0) {
            expiringVehicles.push({
              ...vehicle,
              expiringDocuments: expiringDocs,
              nearestExpiryDays: Math.min(...expiringDocs.map(doc => doc.daysUntilExpiry))
            });
          }
        });
        
        return { success: true, data: expiringVehicles };
      }
    } catch (error) {
      console.error('Error fetching expiring vehicles:', error);
      return { success: false, data: [] };
    }
  },

  // Get expired vehicles
  getExpiredVehicles: async () => {
    try {
      // Try backend API first
      try {
        const response = await api.get('/notifications/expired');
        return { success: true, data: response.data.data || response.data };
      } catch (apiError) {
        // Backend API not available, use vehicle service fallback
        console.log('Backend API not available, using vehicle service fallback...', apiError.message);
        
        // Fallback to vehicle service
        const vehiclesResult = await vehicleService.getAllVehicles();
        const vehicles = vehiclesResult.data || [];
        
        const currentDate = new Date();
        const expiredVehicles = [];
        
        vehicles.forEach(vehicle => {
          const expiredDocs = [];
          
          // Check insurance expiry
          if (vehicle.insuranceExpiry) {
            const expiryDate = new Date(vehicle.insuranceExpiry);
            const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry < 0) {
              expiredDocs.push({ type: 'Insurance', expiryDate: vehicle.insuranceExpiry, daysOverdue: Math.abs(daysUntilExpiry) });
            }
          }
          
          // Check registration expiry
          if (vehicle.registrationExpiry) {
            const expiryDate = new Date(vehicle.registrationExpiry);
            const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
            if (daysUntilExpiry < 0) {
              expiredDocs.push({ type: 'Registration', expiryDate: vehicle.registrationExpiry, daysOverdue: Math.abs(daysUntilExpiry) });
            }
          }
          
          if (expiredDocs.length > 0) {
            expiredVehicles.push({
              ...vehicle,
              expiredDocuments: expiredDocs
            });
          }
        });
        
        return { success: true, data: expiredVehicles };
      }
    } catch (error) {
      console.error('Error fetching expired vehicles:', error);
      return { success: false, data: [] };
    }
  },

  // Trigger manual notifications (mock)
  triggerManualNotifications: async (vehicleId, notificationType) => {
    try {
      // Mock implementation - just return success
      return { 
        success: true, 
        message: `${notificationType} notification triggered for vehicle ${vehicleId}` 
      };
    } catch (error) {
      console.error('Error triggering notifications:', error);
      return { success: false, message: 'Failed to trigger notification' };
    }
  },

  // Get notification history (mock)
  getNotificationHistory: async (vehicleId) => {
    try {
      // Mock notification history
      return { 
        success: true, 
        data: [
          {
            id: '1',
            vehicleId,
            type: 'Insurance Expiry',
            message: 'Insurance expiring in 7 days',
            sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'sent'
          },
          {
            id: '2',
            vehicleId,
            type: 'Maintenance Reminder',
            message: 'Scheduled maintenance due',
            sentAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'sent'
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching notification history:', error);
      return { success: false, data: [] };
    }
  },

  // Get expiry summary (mock)
  getExpirySummary: async () => {
    try {
      const expiringResult = await notificationService.getExpiringVehicles(30);
      const expiredResult = await notificationService.getExpiredVehicles();
      
      return { 
        success: true, 
        data: {
          expiringSoon: expiringResult.data?.length || 0,
          expired: expiredResult.data?.length || 0,
          total: (expiringResult.data?.length || 0) + (expiredResult.data?.length || 0)
        }
      };
    } catch (error) {
      console.error('Error fetching expiry summary:', error);
      return { success: false, data: { expiringSoon: 0, expired: 0, total: 0 } };
    }
  },

  // Update notification preferences (mock)
  updateNotificationPreferences: async (preferences) => {
    try {
      // Mock implementation - just return success
      localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
      return { 
        success: true, 
        message: 'Notification preferences updated successfully' 
      };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return { success: false, message: 'Failed to update preferences' };
    }
  },

  // Trigger manual notification check (mock)
  triggerManualNotificationCheck: async (days = 30) => {
    try {
      const expiringResult = await notificationService.getExpiringVehicles(days);
      const count = expiringResult.data?.length || 0;
      
      return { 
        success: true, 
        message: `Manual notification check completed for ${count} vehicles` 
      };
    } catch (error) {
      console.error('Error triggering manual notification check:', error);
      return { success: false, message: 'Failed to trigger notification check' };
    }
  },

  // Send weekly summary report (mock)
  sendWeeklySummaryReport: async () => {
    try {
      return { 
        success: true, 
        message: 'Weekly summary report sent successfully',
        reportUrl: '/reports/weekly-' + Date.now() + '.pdf'
      };
    } catch (error) {
      console.error('Error sending weekly summary report:', error);
      return { success: false, message: 'Failed to send weekly report' };
    }
  },

  // Send monthly summary report (mock)
  sendMonthlySummaryReport: async () => {
    try {
      return { 
        success: true, 
        message: 'Monthly summary report sent successfully',
        reportUrl: '/reports/monthly-' + Date.now() + '.pdf'
      };
    } catch (error) {
      console.error('Error sending monthly summary report:', error);
      return { success: false, message: 'Failed to send monthly report' };
    }
  }
};

export default notificationService;
