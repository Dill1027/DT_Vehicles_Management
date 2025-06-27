import api from './api';

const notificationService = {
  // Get expiring vehicles
  getExpiringVehicles: async (days = 30) => {
    try {
      const response = await api.get(`/vehicles/expiring?days=${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expiring vehicles:', error);
      throw error;
    }
  },

  // Get expired vehicles
  getExpiredVehicles: async () => {
    try {
      const response = await api.get('/vehicles/expired');
      return response.data;
    } catch (error) {
      console.error('Error fetching expired vehicles:', error);
      throw error;
    }
  },

  // Trigger manual notifications
  triggerManualNotifications: async (vehicleId, notificationType) => {
    try {
      const response = await api.post('/vehicles/notify', {
        vehicleId,
        type: notificationType
      });
      return response.data;
    } catch (error) {
      console.error('Error triggering notifications:', error);
      throw error;
    }
  },

  // Get notification history
  getNotificationHistory: async (vehicleId) => {
    try {
      const response = await api.get(`/vehicles/${vehicleId}/notifications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching notification history:', error);
      throw error;
    }
  },

  // Get expiry summary
  getExpirySummary: async () => {
    try {
      const response = await api.get('/vehicles/expiry-summary');
      return response.data;
    } catch (error) {
      console.error('Error fetching expiry summary:', error);
      throw error;
    }
  },

  // Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    try {
      const response = await api.put('/users/notification-preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  },

  // Trigger manual notification check
  triggerManualNotificationCheck: async (days = 30) => {
    try {
      const response = await api.post('/vehicles/notifications/trigger', { days });
      return response.data;
    } catch (error) {
      console.error('Error triggering manual notification check:', error);
      throw error;
    }
  },

  // Send weekly summary report
  sendWeeklySummaryReport: async () => {
    try {
      const response = await api.post('/vehicles/reports/weekly');
      return response.data;
    } catch (error) {
      console.error('Error sending weekly summary report:', error);
      throw error;
    }
  },

  // Send monthly summary report
  sendMonthlySummaryReport: async () => {
    try {
      const response = await api.post('/vehicles/reports/monthly');
      return response.data;
    } catch (error) {
      console.error('Error sending monthly summary report:', error);
      throw error;
    }
  }
};

export default notificationService;
