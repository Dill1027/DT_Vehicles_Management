import { vehicleService } from './vehicleService';
import api from './api';

const notificationService = {
  // Get vehicles with expiring insurance
  getInsuranceExpiryAlerts: async (days = 30) => {
    try {
      // Try backend API first, fallback to vehicle service
      try {
        const response = await api.get(`/notifications/insurance-expiry?days=${days}`);
        return { success: true, data: response.data.data || response.data };
      } catch (apiError) {
        // Backend API not available, use vehicle service fallback
        console.log('Backend API not available, using vehicle service...', apiError.message);
        
        // Fallback to vehicle service
        const vehiclesResult = await vehicleService.getAllVehicles();
        console.log('Vehicles result:', vehiclesResult);
        
        // Handle different response formats
        let vehicles = [];
        if (vehiclesResult && vehiclesResult.data && Array.isArray(vehiclesResult.data)) {
          vehicles = vehiclesResult.data;
        } else if (vehiclesResult && Array.isArray(vehiclesResult)) {
          vehicles = vehiclesResult;
        } else if (vehiclesResult && vehiclesResult.success && Array.isArray(vehiclesResult.data)) {
          vehicles = vehiclesResult.data;
        } else {
          console.warn('Unexpected vehicles result format:', vehiclesResult);
          vehicles = [];
        }
        
        const currentDate = new Date();
        const insuranceAlerts = [];
        
        vehicles.forEach(vehicle => {
          if (vehicle.insuranceExpiry) {
            // Parse the ISO date string correctly
            const expiryDate = new Date(vehicle.insuranceExpiry);
            const today = new Date();
            
            // Set both dates to start of day for accurate comparison
            const expiryDateOnly = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
            const currentDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            const daysUntilExpiry = Math.ceil((expiryDateOnly - currentDateOnly) / (1000 * 60 * 60 * 24));
            
            console.log(`🔧 Insurance Debug: Vehicle ${vehicle.vehicleNumber} - Expiry: ${vehicle.insuranceExpiry}, ExpiryDateOnly: ${expiryDateOnly.toISOString().split('T')[0]}, CurrentDateOnly: ${currentDateOnly.toISOString().split('T')[0]}, Days: ${daysUntilExpiry}, IsExpired: ${daysUntilExpiry <= 0}`);
            
            // Include vehicles with insurance expiring within the specified days or already expired
            if (daysUntilExpiry <= days) {
              let urgencyLevel = 'info';
              if (daysUntilExpiry <= 0) {
                urgencyLevel = 'expired';
              } else if (daysUntilExpiry <= 7) {
                urgencyLevel = 'critical';
              } else if (daysUntilExpiry <= 15) {
                urgencyLevel = 'warning';
              }
              
              insuranceAlerts.push({
                ...vehicle,
                insuranceExpiryDate: vehicle.insuranceExpiry,
                daysUntilExpiry,
                isExpired: daysUntilExpiry <= 0,
                urgencyLevel
              });
            }
          }
        });
        
        console.log('Insurance alerts processed:', {
          totalVehicles: vehicles.length,
          vehiclesWithInsurance: vehicles.filter(v => v.insuranceExpiry).length,
          alertsGenerated: insuranceAlerts.length,
          expiredCount: insuranceAlerts.filter(a => a.isExpired).length,
          sampleExpired: insuranceAlerts.filter(a => a.isExpired).slice(0, 2)
        });
        
        // Sort by urgency (expired first, then by days remaining)
        insuranceAlerts.sort((a, b) => {
          if (a.isExpired && !b.isExpired) return -1;
          if (!a.isExpired && b.isExpired) return 1;
          return a.daysUntilExpiry - b.daysUntilExpiry;
        });

        return { success: true, data: insuranceAlerts };
      }
    } catch (error) {
      console.error('Error fetching insurance expiry alerts:', error);
      return { success: false, data: [] };
    }
  },

  // Get vehicles with expiring licenses
  getLicenseExpiryAlerts: async (days = 30) => {
    try {
      // Try backend API first, fallback to vehicle service
      try {
        const response = await api.get(`/notifications/license-expiry?days=${days}`);
        return { success: true, data: response.data.data || response.data };
      } catch (apiError) {
        // Backend API not available, use vehicle service fallback
        console.log('Backend API not available, using vehicle service for license alerts...', apiError.message);
        
        // Fallback to vehicle service
        const vehiclesResult = await vehicleService.getAllVehicles();
        
        // Handle different response formats
        let vehicles = [];
        if (vehiclesResult && vehiclesResult.data && Array.isArray(vehiclesResult.data)) {
          vehicles = vehiclesResult.data;
        } else if (vehiclesResult && Array.isArray(vehiclesResult)) {
          vehicles = vehiclesResult;
        } else if (vehiclesResult && vehiclesResult.success && Array.isArray(vehiclesResult.data)) {
          vehicles = vehiclesResult.data;
        } else {
          console.warn('Unexpected vehicles result format:', vehiclesResult);
          vehicles = [];
        }
        
        const licenseAlerts = [];
        
        vehicles.forEach(vehicle => {
          if (vehicle.licenseExpiry) {
            // Parse the ISO date string correctly
            const expiryDate = new Date(vehicle.licenseExpiry);
            const today = new Date();
            
            // Set both dates to start of day for accurate comparison
            const expiryDateOnly = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
            const currentDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            
            const daysUntilExpiry = Math.ceil((expiryDateOnly - currentDateOnly) / (1000 * 60 * 60 * 24));
            
            console.log(`🔧 License Debug: Vehicle ${vehicle.vehicleNumber} - Expiry: ${vehicle.licenseExpiry}, ExpiryDateOnly: ${expiryDateOnly.toISOString().split('T')[0]}, CurrentDateOnly: ${currentDateOnly.toISOString().split('T')[0]}, Days: ${daysUntilExpiry}, IsExpired: ${daysUntilExpiry <= 0}`);
            
            // Include vehicles with license expiring within the specified days or already expired
            if (daysUntilExpiry <= days) {
              let urgencyLevel = 'info';
              if (daysUntilExpiry <= 0) {
                urgencyLevel = 'expired';
              } else if (daysUntilExpiry <= 7) {
                urgencyLevel = 'critical';
              } else if (daysUntilExpiry <= 15) {
                urgencyLevel = 'warning';
              }
              
              licenseAlerts.push({
                ...vehicle,
                licenseExpiryDate: vehicle.licenseExpiry,
                daysUntilExpiry,
                isExpired: daysUntilExpiry <= 0,
                urgencyLevel
              });
            }
          }
        });
        
        console.log('License alerts processed:', {
          totalVehicles: vehicles.length,
          vehiclesWithLicense: vehicles.filter(v => v.licenseExpiry).length,
          alertsGenerated: licenseAlerts.length,
          expiredCount: licenseAlerts.filter(a => a.isExpired).length,
          sampleExpired: licenseAlerts.filter(a => a.isExpired).slice(0, 2)
        });
        
        // Sort by urgency (expired first, then by days remaining)
        licenseAlerts.sort((a, b) => {
          if (a.isExpired && !b.isExpired) return -1;
          if (!a.isExpired && b.isExpired) return 1;
          return a.daysUntilExpiry - b.daysUntilExpiry;
        });
        
        return { success: true, data: licenseAlerts };
      }
    } catch (error) {
      console.error('Error fetching license expiry alerts:', error);
      return { success: false, data: [] };
    }
  },

  // Get expiring vehicles
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
