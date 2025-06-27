import api from './api';

const reportService = {
  // Download vehicle summary report
  downloadVehicleSummaryReport: async () => {
    try {
      const response = await api.get('/vehicles/reports/pdf/summary', {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vehicle-summary-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading vehicle summary report:', error);
      throw error;
    }
  },

  // Download expiry alerts report
  downloadExpiryAlertsReport: async (days = 30) => {
    try {
      const response = await api.get(`/vehicles/reports/pdf/expiry-alerts?days=${days}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expiry-alerts-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading expiry alerts report:', error);
      throw error;
    }
  },

  // Download maintenance report
  downloadMaintenanceReport: async () => {
    try {
      const response = await api.get('/vehicles/reports/pdf/maintenance', {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `maintenance-report-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading maintenance report:', error);
      throw error;
    }
  },

  // Get report statistics
  getReportStatistics: async () => {
    try {
      const response = await api.get('/vehicles/reports/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching report statistics:', error);
      throw error;
    }
  },

  // Generate custom report
  generateCustomReport: async (reportConfig) => {
    try {
      const response = await api.post('/vehicles/reports/custom', reportConfig, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `custom-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  }
};

export default reportService;
