import { mockVehicleService } from './mockDataService';

const reportService = {
  // Mock PDF generation for static deployment
  generateMockPDF: (title, data) => {
    // Create a simple text file as mock PDF
    const content = `${title}\n\nGenerated on: ${new Date().toLocaleString()}\n\nData: ${JSON.stringify(data, null, 2)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  // Download vehicle summary report (mock)
  downloadVehicleSummaryReport: async () => {
    try {
      const vehiclesResult = await mockVehicleService.getAllVehicles();
      const vehicles = vehiclesResult.data || [];
      
      reportService.generateMockPDF('Vehicle Summary Report', {
        totalVehicles: vehicles.length,
        availableVehicles: vehicles.filter(v => v.status === 'available').length,
        inUseVehicles: vehicles.filter(v => v.status === 'in-use').length,
        inUse: vehicles.filter(v => v.status === 'In Service').length,
        vehicles: vehicles.map(v => ({
          vehicleId: v.vehicleId,
          make: v.make,
          model: v.model,
          status: v.status,
          department: v.department
        }))
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading vehicle summary report:', error);
      throw new Error('Failed to generate vehicle summary report');
    }
  },

  // Download expiry alerts report (mock)
  downloadExpiryAlertsReport: async (days = 30) => {
    try {
      const vehiclesResult = await mockVehicleService.getAllVehicles();
      const vehicles = vehiclesResult.data || [];
      
      const currentDate = new Date();
      const expiringVehicles = [];
      
      vehicles.forEach(vehicle => {
        const expiries = [];
        
        if (vehicle.insuranceExpiry) {
          const expiryDate = new Date(vehicle.insuranceExpiry);
          const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry <= days) {
            expiries.push({ type: 'Insurance', expiryDate: vehicle.insuranceExpiry, daysUntilExpiry });
          }
        }
        
        if (vehicle.registrationExpiry) {
          const expiryDate = new Date(vehicle.registrationExpiry);
          const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
          if (daysUntilExpiry <= days) {
            expiries.push({ type: 'Registration', expiryDate: vehicle.registrationExpiry, daysUntilExpiry });
          }
        }
        
        if (expiries.length > 0) {
          expiringVehicles.push({
            vehicleId: vehicle.vehicleId,
            make: vehicle.make,
            model: vehicle.model,
            expiries
          });
        }
      });
      
      reportService.generateMockPDF('Expiry Alerts Report', {
        totalExpiringVehicles: expiringVehicles.length,
        reportPeriod: `Next ${days} days`,
        vehicles: expiringVehicles
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading expiry alerts report:', error);
      throw new Error('Failed to generate expiry alerts report');
    }
  },

  // Get report statistics (mock)
  getReportStatistics: async () => {
    try {
      const vehiclesResult = await mockVehicleService.getAllVehicles();
      const vehicles = vehiclesResult.data || [];
      
      return { 
        success: true, 
        data: {
          totalVehicles: vehicles.length,
          reportsGenerated: 42,
          lastReportDate: new Date().toISOString(),
          vehiclesByStatus: {
            available: vehicles.filter(v => v.status === 'available').length,
            'in-use': vehicles.filter(v => v.status === 'in-use').length,
            inUse: vehicles.filter(v => v.status === 'In Service').length
          }
        }
      };
    } catch (error) {
      console.error('Error fetching report statistics:', error);
      return { success: false, data: null };
    }
  },

  // Generate custom report (mock)
  generateCustomReport: async (reportConfig) => {
    try {
      reportService.generateMockPDF('Custom Report', {
        config: reportConfig,
        generatedAt: new Date().toISOString(),
        note: 'This is a mock custom report for demo purposes'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw new Error('Failed to generate custom report');
    }
  }
};

export default reportService;
