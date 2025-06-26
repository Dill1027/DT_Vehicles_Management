const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFReportGenerator {
  constructor() {
    this.colors = {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      light: '#f9fafb'
    };
  }

  /**
   * Generate vehicle summary report
   * @param {Array} vehicles - Array of vehicles
   * @param {Object} options - Report options
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateVehicleSummaryReport(vehicles, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        this.addHeader(doc, 'Deep Tec Engineering (Pvt) Ltd', 'Vehicle Summary Report');
        
        // Report info
        doc.moveDown(1);
        doc.fontSize(10).fillColor(this.colors.secondary);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.text(`Total Vehicles: ${vehicles.length}`, { align: 'right' });
        
        // Summary statistics
        this.addSummaryStats(doc, vehicles);
        
        // Vehicle list
        doc.addPage();
        this.addVehicleTable(doc, vehicles);
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate expiry alerts report
   * @param {Array} vehicles - Vehicles with expiry alerts
   * @param {Object} options - Report options
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateExpiryAlertsReport(vehicles, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        this.addHeader(doc, 'Deep Tec Engineering (Pvt) Ltd', 'Document Expiry Alerts Report');
        
        // Report info
        doc.moveDown(1);
        doc.fontSize(10).fillColor(this.colors.secondary);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.text(`Vehicles with Alerts: ${vehicles.length}`, { align: 'right' });
        
        // Categorize vehicles by alert priority
        const expiredVehicles = vehicles.filter(v => 
          v.getExpiryAlerts().some(alert => alert.priority === 'expired')
        );
        const highPriorityVehicles = vehicles.filter(v => 
          v.getExpiryAlerts().some(alert => alert.priority === 'high')
        );
        const mediumPriorityVehicles = vehicles.filter(v => 
          v.getExpiryAlerts().some(alert => alert.priority === 'medium')
        );
        const lowPriorityVehicles = vehicles.filter(v => 
          v.getExpiryAlerts().some(alert => alert.priority === 'low')
        );

        // Alert summary
        this.addAlertSummary(doc, {
          expired: expiredVehicles.length,
          high: highPriorityVehicles.length,
          medium: mediumPriorityVehicles.length,
          low: lowPriorityVehicles.length
        });

        // Expired vehicles section
        if (expiredVehicles.length > 0) {
          doc.addPage();
          this.addExpirySection(doc, 'EXPIRED DOCUMENTS', expiredVehicles, this.colors.danger);
        }

        // High priority section
        if (highPriorityVehicles.length > 0) {
          if (doc.y > 500) doc.addPage();
          this.addExpirySection(doc, 'HIGH PRIORITY (≤7 days)', highPriorityVehicles, this.colors.warning);
        }

        // Medium priority section
        if (mediumPriorityVehicles.length > 0) {
          if (doc.y > 500) doc.addPage();
          this.addExpirySection(doc, 'MEDIUM PRIORITY (≤15 days)', mediumPriorityVehicles, this.colors.warning);
        }

        // Low priority section
        if (lowPriorityVehicles.length > 0) {
          if (doc.y > 500) doc.addPage();
          this.addExpirySection(doc, 'LOW PRIORITY (≤30 days)', lowPriorityVehicles, this.colors.accent);
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate maintenance report
   * @param {Array} vehicles - Vehicles with maintenance data
   * @param {Object} options - Report options
   * @returns {Promise<Buffer>} - PDF buffer
   */
  async generateMaintenanceReport(vehicles, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        // Header
        this.addHeader(doc, 'Deep Tec Engineering (Pvt) Ltd', 'Vehicle Maintenance Report');
        
        // Report info
        doc.moveDown(1);
        doc.fontSize(10).fillColor(this.colors.secondary);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.text(`Total Vehicles: ${vehicles.length}`, { align: 'right' });
        
        // Maintenance summary
        this.addMaintenanceSummary(doc, vehicles);
        
        // Maintenance details
        doc.addPage();
        this.addMaintenanceTable(doc, vehicles);
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add header to document
   */
  addHeader(doc, companyName, reportTitle) {
    // Company name
    doc.fontSize(18).fillColor(this.colors.primary);
    doc.text(companyName, { align: 'center' });
    
    // Report title
    doc.fontSize(14).fillColor(this.colors.secondary);
    doc.text(reportTitle, { align: 'center' });
    
    // Divider line
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(this.colors.accent);
  }

  /**
   * Add summary statistics
   */
  addSummaryStats(doc, vehicles) {
    doc.moveDown(2);
    doc.fontSize(14).fillColor(this.colors.primary);
    doc.text('Fleet Summary', { underline: true });
    
    // Calculate statistics
    const stats = {
      total: vehicles.length,
      active: vehicles.filter(v => v.status === 'Active').length,
      inService: vehicles.filter(v => v.status === 'In Service').length,
      outOfService: vehicles.filter(v => v.status === 'Out of Service').length,
      retired: vehicles.filter(v => v.status === 'Retired').length
    };

    const departments = {};
    vehicles.forEach(v => {
      departments[v.department] = (departments[v.department] || 0) + 1;
    });

    doc.moveDown(1);
    doc.fontSize(10).fillColor(this.colors.secondary);
    
    // Status breakdown
    doc.text(`Active: ${stats.active}`, 50, doc.y);
    doc.text(`In Service: ${stats.inService}`, 150, doc.y);
    doc.text(`Out of Service: ${stats.outOfService}`, 250, doc.y);
    doc.text(`Retired: ${stats.retired}`, 350, doc.y);
    
    // Department breakdown
    doc.moveDown(1.5);
    doc.fontSize(12).fillColor(this.colors.primary);
    doc.text('Department Distribution:', { underline: true });
    
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor(this.colors.secondary);
    Object.entries(departments).forEach(([dept, count]) => {
      doc.text(`${dept}: ${count} vehicles`);
    });
  }

  /**
   * Add vehicle table
   */
  addVehicleTable(doc, vehicles) {
    doc.fontSize(14).fillColor(this.colors.primary);
    doc.text('Vehicle Details', { underline: true });
    
    doc.moveDown(1);
    
    // Table header
    const startY = doc.y;
    const rowHeight = 20;
    
    doc.fontSize(8).fillColor(this.colors.primary);
    doc.text('Vehicle #', 50, startY);
    doc.text('Make/Model', 120, startY);
    doc.text('Type', 200, startY);
    doc.text('Department', 250, startY);
    doc.text('Status', 320, startY);
    doc.text('Insurance Exp.', 380, startY);
    doc.text('Revenue Exp.', 460, startY);
    
    // Table line
    doc.moveTo(50, startY + 12).lineTo(550, startY + 12).stroke();
    
    // Table rows
    let currentY = startY + 20;
    doc.fontSize(7).fillColor(this.colors.secondary);
    
    vehicles.forEach((vehicle, index) => {
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
      }
      
      doc.text(vehicle.vehicleNumber || '', 50, currentY);
      doc.text(vehicle.modelMake || '', 120, currentY);
      doc.text(vehicle.type || '', 200, currentY);
      doc.text(vehicle.department || '', 250, currentY);
      doc.text(vehicle.status || '', 320, currentY);
      doc.text(vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toLocaleDateString() : '', 380, currentY);
      doc.text(vehicle.revenueExpiry ? new Date(vehicle.revenueExpiry).toLocaleDateString() : '', 460, currentY);
      
      currentY += rowHeight;
    });
  }

  /**
   * Add alert summary
   */
  addAlertSummary(doc, stats) {
    doc.moveDown(2);
    doc.fontSize(14).fillColor(this.colors.primary);
    doc.text('Alert Summary', { underline: true });
    
    doc.moveDown(1);
    
    // Alert boxes
    const boxWidth = 100;
    const boxHeight = 60;
    const startX = 50;
    const spacing = 120;
    
    // Expired
    doc.rect(startX, doc.y, boxWidth, boxHeight).fillAndStroke(this.colors.danger, this.colors.danger);
    doc.fillColor('white').fontSize(10);
    doc.text('EXPIRED', startX + 10, doc.y - boxHeight + 15);
    doc.fontSize(20).text(stats.expired.toString(), startX + 35, doc.y - 35);
    
    // High Priority
    doc.rect(startX + spacing, doc.y - boxHeight, boxWidth, boxHeight).fillAndStroke(this.colors.warning, this.colors.warning);
    doc.fillColor('white').fontSize(10);
    doc.text('HIGH (≤7d)', startX + spacing + 10, doc.y - boxHeight + 15);
    doc.fontSize(20).text(stats.high.toString(), startX + spacing + 35, doc.y - 35);
    
    // Medium Priority
    doc.rect(startX + spacing * 2, doc.y - boxHeight, boxWidth, boxHeight).fillAndStroke(this.colors.warning, this.colors.warning);
    doc.fillColor('white').fontSize(10);
    doc.text('MEDIUM (≤15d)', startX + spacing * 2 + 5, doc.y - boxHeight + 15);
    doc.fontSize(20).text(stats.medium.toString(), startX + spacing * 2 + 35, doc.y - 35);
    
    // Low Priority
    doc.rect(startX + spacing * 3, doc.y - boxHeight, boxWidth, boxHeight).fillAndStroke(this.colors.accent, this.colors.accent);
    doc.fillColor('white').fontSize(10);
    doc.text('LOW (≤30d)', startX + spacing * 3 + 10, doc.y - boxHeight + 15);
    doc.fontSize(20).text(stats.low.toString(), startX + spacing * 3 + 35, doc.y - 35);
    
    doc.moveDown(2);
  }

  /**
   * Add expiry section
   */
  addExpirySection(doc, title, vehicles, color) {
    doc.moveDown(1);
    doc.fontSize(14).fillColor(color);
    doc.text(title, { underline: true });
    
    doc.moveDown(1);
    doc.fontSize(9).fillColor(this.colors.secondary);
    
    vehicles.forEach(vehicle => {
      const alerts = vehicle.getExpiryAlerts();
      
      doc.fontSize(10).fillColor(this.colors.primary);
      doc.text(`${vehicle.vehicleNumber} - ${vehicle.modelMake} (${vehicle.department})`);
      
      doc.fontSize(8).fillColor(this.colors.secondary);
      alerts.forEach(alert => {
        if (title.includes('EXPIRED') && alert.priority === 'expired') {
          doc.text(`• ${alert.document}: Expired ${Math.abs(alert.daysRemaining)} days ago (${new Date(alert.expiryDate).toLocaleDateString()})`);
        } else if (!title.includes('EXPIRED') && alert.priority !== 'expired') {
          doc.text(`• ${alert.document}: ${alert.daysRemaining} days remaining (${new Date(alert.expiryDate).toLocaleDateString()})`);
        }
      });
      
      doc.moveDown(0.5);
    });
  }

  /**
   * Add maintenance summary
   */
  addMaintenanceSummary(doc, vehicles) {
    doc.moveDown(2);
    doc.fontSize(14).fillColor(this.colors.primary);
    doc.text('Maintenance Summary', { underline: true });
    
    const maintenanceStats = {
      upcoming: vehicles.filter(v => v.nextMaintenanceDate && v.nextMaintenanceDate > new Date()).length,
      overdue: vehicles.filter(v => v.nextMaintenanceDate && v.nextMaintenanceDate < new Date()).length,
      recentlyServiced: vehicles.filter(v => {
        if (!v.lastMaintenanceDate) return false;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return v.lastMaintenanceDate > thirtyDaysAgo;
      }).length
    };
    
    doc.moveDown(1);
    doc.fontSize(10).fillColor(this.colors.secondary);
    doc.text(`Upcoming Maintenance: ${maintenanceStats.upcoming}`);
    doc.text(`Overdue Maintenance: ${maintenanceStats.overdue}`);
    doc.text(`Recently Serviced (30 days): ${maintenanceStats.recentlyServiced}`);
  }

  /**
   * Add maintenance table
   */
  addMaintenanceTable(doc, vehicles) {
    doc.fontSize(14).fillColor(this.colors.primary);
    doc.text('Maintenance Schedule', { underline: true });
    
    doc.moveDown(1);
    
    // Filter vehicles with maintenance data
    const vehiclesWithMaintenance = vehicles.filter(v => 
      v.lastMaintenanceDate || v.nextMaintenanceDate
    );
    
    // Table header
    const startY = doc.y;
    
    doc.fontSize(8).fillColor(this.colors.primary);
    doc.text('Vehicle #', 50, startY);
    doc.text('Make/Model', 120, startY);
    doc.text('Last Service', 200, startY);
    doc.text('Next Service', 280, startY);
    doc.text('Status', 360, startY);
    doc.text('Notes', 420, startY);
    
    // Table line
    doc.moveTo(50, startY + 12).lineTo(550, startY + 12).stroke();
    
    // Table rows
    let currentY = startY + 20;
    doc.fontSize(7).fillColor(this.colors.secondary);
    
    vehiclesWithMaintenance.forEach(vehicle => {
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
      }
      
      const isOverdue = vehicle.nextMaintenanceDate && vehicle.nextMaintenanceDate < new Date();
      
      doc.text(vehicle.vehicleNumber || '', 50, currentY);
      doc.text(vehicle.modelMake || '', 120, currentY);
      doc.text(vehicle.lastMaintenanceDate ? new Date(vehicle.lastMaintenanceDate).toLocaleDateString() : '', 200, currentY);
      doc.text(vehicle.nextMaintenanceDate ? new Date(vehicle.nextMaintenanceDate).toLocaleDateString() : '', 280, currentY);
      doc.fillColor(isOverdue ? this.colors.danger : this.colors.success);
      doc.text(isOverdue ? 'OVERDUE' : 'SCHEDULED', 360, currentY);
      doc.fillColor(this.colors.secondary);
      doc.text(vehicle.maintenanceNotes ? vehicle.maintenanceNotes.substring(0, 30) + '...' : '', 420, currentY);
      
      currentY += 20;
    });
  }
}

module.exports = PDFReportGenerator;
