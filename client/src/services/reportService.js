import api from './api';

export const reportService = {
  // Download vehicle summary report
  downloadVehicleSummaryReport: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await api.get(`/vehicles/reports/summary?${queryParams.toString()}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `vehicle-summary-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error downloading vehicle summary report:', error);
      throw error;
    }
  },

  // Download expiry alerts report
  downloadExpiryAlertsReport: async (days = 30) => {
    try {
      const response = await api.get(`/vehicles/reports/expiry-alerts?days=${days}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expiry-alerts-${days}days-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (error) {
      console.error('Error downloading expiry alerts report:', error);
      throw error;
    }
  },

  // Download maintenance report
  downloadMaintenanceReport: async (vehicleId) => {
    try {
      const response = await api.get(`/vehicles/${vehicleId}/reports/maintenance`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `maintenance-report-${vehicleId}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
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
      
      return response.data;
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw error;
    }
  }
};

export default reportService;
