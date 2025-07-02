const Notification = require('../models/Notification');
const Vehicle = require('../models/Vehicle');
const { sendExpiryNotification, sendSummaryReport } = require('../utils/email');
const cron = require('node-cron');

// Configuration for notification recipients
const NOTIFICATION_CONFIG = {
  // Default recipients for different types of notifications
  defaultRecipients: [
    process.env.ADMIN_EMAIL || 'admin@deeptec.com',
    process.env.FLEET_MANAGER_EMAIL || 'fleet@deeptec.com'
  ],
  
  // Department-specific recipients
  departmentRecipients: {
    'Engineering': ['engineering@deeptec.com'],
    'Operations': ['operations@deeptec.com'],
    'Administration': ['admin@deeptec.com'],
    'Sales': ['sales@deeptec.com'],
    'Maintenance': ['maintenance@deeptec.com'],
    'Executive': ['executive@deeptec.com']
  }
};

class NotificationService {
  constructor() {
    this.init();
  }

  init() {
    console.log('🚀 Initializing Deep Tec notification scheduler...');
    
    // Daily check for expiring documents (runs at 9:00 AM)
    cron.schedule('0 9 * * *', async () => {
      console.log('⏰ Running daily expiry check...');
      await this.checkAndNotifyExpiringDocuments(30);
    }, {
      scheduled: true,
      timezone: "Asia/Colombo" // Sri Lanka timezone
    });
    
    // Weekly check for documents expiring in 7 days (runs every Monday at 8:00 AM)
    cron.schedule('0 8 * * 1', async () => {
      console.log('⏰ Running weekly high-priority expiry check...');
      await this.checkAndNotifyExpiringDocuments(7);
    }, {
      scheduled: true,
      timezone: "Asia/Colombo"
    });
    
    // Weekly summary report (runs every Friday at 5:00 PM)
    cron.schedule('0 17 * * 5', async () => {
      console.log('⏰ Sending weekly summary report...');
      await this.sendWeeklySummaryReport();
    }, {
      scheduled: true,
      timezone: "Asia/Colombo"
    });
    
    // Monthly summary report (runs on the 1st day of each month at 10:00 AM)
    cron.schedule('0 10 1 * *', async () => {
      console.log('⏰ Sending monthly summary report...');
      await this.sendMonthlySummaryReport();
    }, {
      scheduled: true,
      timezone: "Asia/Colombo"
    });
    
    console.log('✅ Notification scheduler initialized successfully');
    console.log('📅 Scheduled jobs:');
    console.log('   - Daily expiry check: 9:00 AM');
    console.log('   - Weekly priority check: Monday 8:00 AM');
    console.log('   - Weekly report: Friday 5:00 PM');
    console.log('   - Monthly report: 1st day of month 10:00 AM');
  }

  /**
   * Check for vehicles with expiring documents and send notifications
   * @param {number} days - Number of days ahead to check for expiring documents
   * @returns {Promise} - Result of notification process
   */
  async checkAndNotifyExpiringDocuments(days = 30) {
    try {
      console.log(`🔍 Checking for vehicles with documents expiring in ${days} days...`);
      
      // Get vehicles with expiring documents
      const vehicles = await Vehicle.getExpiringVehicles(days);
      
      if (vehicles.length === 0) {
        console.log('✅ No vehicles found with expiring documents');
        return { success: true, vehiclesProcessed: 0 };
      }

      console.log(`📋 Found ${vehicles.length} vehicles with expiring documents`);
      
      let notificationsSent = 0;
      let errors = [];

      for (const vehicle of vehicles) {
        try {
          const alerts = vehicle.getExpiryAlerts();
          
          if (alerts.length === 0) continue;

          // Determine recipients based on department and priority
          const recipients = this.getRecipientsForVehicle(vehicle, alerts);
          
          // Send notifications to all recipients
          for (const recipient of recipients) {
            const result = await sendExpiryNotification(vehicle, alerts, recipient);
            
            if (result.success) {
              notificationsSent++;
              
              // Update notification tracking in vehicle document
              await this.updateNotificationTracking(vehicle, alerts, recipient);
            } else {
              errors.push({
                vehicle: vehicle.vehicleNumber,
                recipient,
                error: result.error
              });
            }
          }

        } catch (error) {
          console.error(`Error processing vehicle ${vehicle.vehicleNumber}:`, error);
          errors.push({
            vehicle: vehicle.vehicleNumber,
            error: error.message
          });
        }
      }

      console.log(`📧 Sent ${notificationsSent} notifications for ${vehicles.length} vehicles`);
      
      if (errors.length > 0) {
        console.error(`⚠️  ${errors.length} errors occurred:`, errors);
      }

      return {
        success: true,
        vehiclesProcessed: vehicles.length,
        notificationsSent,
        errors
      };

    } catch (error) {
      console.error('Error in checkAndNotifyExpiringDocuments:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get appropriate recipients for a vehicle based on department and alert priority
   * @param {Object} vehicle - Vehicle object
   * @param {Array} alerts - Array of expiry alerts
   * @returns {Array} - Array of recipient email addresses
   */
  getRecipientsForVehicle(vehicle, alerts) {
    const recipients = new Set(NOTIFICATION_CONFIG.defaultRecipients);
    
    // Add department-specific recipients
    if (vehicle.department && NOTIFICATION_CONFIG.departmentRecipients[vehicle.department]) {
      NOTIFICATION_CONFIG.departmentRecipients[vehicle.department].forEach(email => 
        recipients.add(email)
      );
    }
    
    // For high priority/expired alerts, add additional recipients
    const hasHighPriorityAlerts = alerts.some(alert => 
      alert.priority === 'expired' || alert.priority === 'high'
    );
    
    if (hasHighPriorityAlerts) {
      // Add executive team for critical alerts
      if (NOTIFICATION_CONFIG.departmentRecipients['Executive']) {
        NOTIFICATION_CONFIG.departmentRecipients['Executive'].forEach(email => 
          recipients.add(email)
        );
      }
    }
    
    return Array.from(recipients).filter(email => email && email.includes('@'));
  }

  /**
   * Update notification tracking in vehicle document
   * @param {Object} vehicle - Vehicle object
   * @param {Array} alerts - Array of expiry alerts
   * @param {string} recipient - Recipient email
   * @returns {Promise} - Update result
   */
  async updateNotificationTracking(vehicle, alerts, recipient) {
    try {
      const updateData = {};
      const currentDate = new Date();
      
      alerts.forEach(alert => {
        // Map field names to notification types
        const notificationFieldMap = {
          'insuranceExpiry': 'insuranceAlerts',
          'emissionExpiry': 'emissionAlerts',
          'revenueExpiry': 'revenueAlerts',
          'registrationExpiry': 'revenueAlerts', // Group with revenue
          'nextServiceDue': 'serviceAlerts',
          'leaseDue': 'serviceAlerts' // Group with service
        };
        
        const notificationField = notificationFieldMap[alert.field];
        
        if (notificationField) {
          const notificationEntry = {
            alertDate: currentDate,
            daysUntilExpiry: alert.daysRemaining,
            sent: true,
            sentAt: currentDate,
            method: 'email',
            recipient: recipient
          };
          
          updateData[`notifications.${notificationField}`] = {
            $push: notificationEntry
          };
        }
      });
      
      if (Object.keys(updateData).length > 0) {
        await Vehicle.findByIdAndUpdate(vehicle._id, updateData);
      }
      
    } catch (error) {
      console.error('Error updating notification tracking:', error);
    }
  }

  /**
   * Send weekly summary report
   * @returns {Promise} - Result of report sending
   */
  async sendWeeklySummaryReport() {
    try {
      console.log('📊 Generating weekly summary report...');
      
      // Get all vehicles with alerts
      const vehicles = await Vehicle.find({});
      const vehiclesWithAlerts = vehicles.filter(v => v.getExpiryAlerts().length > 0);
      
      const recipients = NOTIFICATION_CONFIG.defaultRecipients.concat(
        NOTIFICATION_CONFIG.departmentRecipients['Executive'] || []
      );
      
      const result = await sendSummaryReport(vehiclesWithAlerts, recipients, 'weekly');
      
      console.log('📧 Weekly summary report sent successfully');
      return result;
      
    } catch (error) {
      console.error('Error sending weekly summary report:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send monthly summary report
   * @returns {Promise} - Result of report sending
   */
  async sendMonthlySummaryReport() {
    try {
      console.log('📊 Generating monthly summary report...');
      
      const vehicles = await Vehicle.find({});
      const vehiclesWithAlerts = vehicles.filter(v => v.getExpiryAlerts().length > 0);
      
      const recipients = NOTIFICATION_CONFIG.defaultRecipients.concat(
        Object.values(NOTIFICATION_CONFIG.departmentRecipients).flat()
      );
      
      const result = await sendSummaryReport(vehiclesWithAlerts, recipients, 'monthly');
      
      console.log('📧 Monthly summary report sent successfully');
      return result;
      
    } catch (error) {
      console.error('Error sending monthly summary report:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manual trigger for testing notifications
   * @param {number} days - Days ahead to check
   * @returns {Promise} - Result of notification check
   */
  async triggerManualNotificationCheck(days = 30) {
    console.log(`🔧 Manual trigger: Checking for expiring documents (${days} days)...`);
    return await this.checkAndNotifyExpiringDocuments(days);
  }

  // Legacy methods for backward compatibility
  async checkAndCreateNotifications() {
    try {
      await this.checkVehicleExpiries();
      await this.checkMaintenanceDue();
      console.log('Legacy notification check completed successfully');
    } catch (error) {
      console.error('Error in legacy notification check:', error);
    }
  }

  async checkVehicleExpiries() {
    // Use the new enhanced method
    return await this.checkAndNotifyExpiringDocuments(30);
  }

  async checkMaintenanceDue() {
    try {
      const vehicles = await Vehicle.find({
        nextMaintenanceDate: { $exists: true }
      }).populate('assignedDriver');
      
      const now = new Date();
      const alertPeriods = [30, 15, 7, 1];

      for (const vehicle of vehicles) {
        for (const period of alertPeriods) {
          const alertDate = new Date();
          alertDate.setDate(now.getDate() + period);

          if (vehicle.nextMaintenanceDate && this.isSameDate(vehicle.nextMaintenanceDate, alertDate)) {
            await this.createMaintenanceNotification({
              type: 'maintenance_due',
              vehicleId: vehicle._id,
              dueDate: vehicle.nextMaintenanceDate,
              period
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking maintenance due:', error);
    }
  }

  async createExpiryNotification(data) {
    try {
      const existing = await Notification.findOne({
        type: data.type,
        vehicleId: data.vehicleId,
        'metadata.period': data.period,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (existing) return;

      const notification = new Notification({
        type: data.type,
        title: this.getNotificationTitle(data.type, data.period),
        message: this.getNotificationMessage(data),
        vehicleId: data.vehicleId,
        priority: data.period <= 7 ? 'high' : data.period <= 15 ? 'medium' : 'low',
        metadata: {
          period: data.period,
          expiryDate: data.expiryDate
        },
        recipients: await this.getNotificationRecipients(data)
      });

      await notification.save();
    } catch (error) {
      console.error('Error creating expiry notification:', error);
    }
  }

  async createLicenseExpiryNotification(data) {
    try {
      const existing = await Notification.findOne({
        type: 'license_expiry',
        'metadata.userId': data.user,
        'metadata.period': data.period,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (existing) return;

      const notification = new Notification({
        type: 'license_expiry',
        title: `License Expiry Alert - ${data.period} days`,
        message: `Driver license expires in ${data.period} days`,
        priority: data.period <= 7 ? 'high' : data.period <= 15 ? 'medium' : 'low',
        metadata: {
          userId: data.user,
          period: data.period,
          expiryDate: data.expiryDate
        },
        recipients: [{ user: data.user, read: false }]
      });

      await notification.save();
    } catch (error) {
      console.error('Error creating license expiry notification:', error);
    }
  }

  async createMaintenanceNotification(data) {
    try {
      const existing = await Notification.findOne({
        type: data.type,
        vehicleId: data.vehicleId,
        'metadata.period': data.period,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (existing) return;

      const notification = new Notification({
        type: data.type,
        title: this.getNotificationTitle(data.type, data.period),
        message: this.getNotificationMessage(data),
        vehicleId: data.vehicleId,
        priority: data.period <= 7 ? 'high' : data.period <= 15 ? 'medium' : 'low',
        metadata: {
          period: data.period,
          dueDate: data.dueDate
        },
        recipients: await this.getNotificationRecipients(data)
      });

      await notification.save();
    } catch (error) {
      console.error('Error creating maintenance notification:', error);
    }
  }

  async sendPendingNotifications() {
    try {
      const notifications = await Notification.find({
        sent: false,
        scheduledFor: { $lte: new Date() }
      }).populate('vehicleId recipients.user');

      for (const notification of notifications) {
        try {
          // Here you would integrate with your email service
          console.log(`Sending notification: ${notification.title}`);
          
          notification.sent = true;
          notification.sentAt = new Date();
          await notification.save();
        } catch (error) {
          console.error(`Failed to send notification ${notification._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error sending pending notifications:', error);
    }
  }

  getNotificationTitle(type, period) {
    const titles = {
      insurance_expiry: `Insurance Expiry Alert - ${period} days`,
      emission_expiry: `Emission Test Expiry Alert - ${period} days`,
      revenue_expiry: `Revenue License Expiry Alert - ${period} days`,
      maintenance_due: `Maintenance Due Alert - ${period} days`
    };
    return titles[type] || 'Vehicle Alert';
  }

  getNotificationMessage(data) {
    const messages = {
      insurance_expiry: `Vehicle insurance expires in ${data.period} days`,
      emission_expiry: `Vehicle emission test expires in ${data.period} days`,
      revenue_expiry: `Vehicle revenue license expires in ${data.period} days`,
      maintenance_due: `Vehicle maintenance is due in ${data.period} days`
    };
    return messages[data.type] || 'Vehicle alert';
  }

  async getNotificationRecipients(data) {
    const recipients = [];
    
    try {
      // Add default admin emails as recipients
      NOTIFICATION_CONFIG.defaultRecipients.forEach(email => {
        recipients.push({ email: email, read: false });
      });

      // Add department-specific recipients if vehicle has department info
      if (data.vehicleId) {
        const vehicle = await Vehicle.findById(data.vehicleId);
        if (vehicle && vehicle.department && NOTIFICATION_CONFIG.departmentRecipients[vehicle.department]) {
          NOTIFICATION_CONFIG.departmentRecipients[vehicle.department].forEach(email => {
            if (!recipients.some(r => r.email === email)) {
              recipients.push({ email: email, read: false });
            }
          });
        }
      }
    } catch (error) {
      console.error('Error getting notification recipients:', error);
    }

    return recipients;
  }

  isSameDate(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  async getNotificationsForUser(userId, options = {}) {
    try {
      const { page = 1, limit = 10, unreadOnly = false } = options;
      const skip = (page - 1) * limit;

      const query = { 'recipients.user': userId };
      if (unreadOnly) {
        query['recipients.read'] = false;
      }

      return await Notification.find(query)
        .populate('vehicleId', 'vehicleNumber modelMake')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } catch (error) {
      console.error('Error getting notifications for user:', error);
      return [];
    }
  }

  async markAllAsReadForUser(userId) {
    try {
      const notifications = await Notification.find({
        'recipients.user': userId,
        'recipients.read': false
      });

      for (const notification of notifications) {
        await notification.markAsRead(userId);
      }

      return notifications.length;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return 0;
    }
  }
}

module.exports = new NotificationService();
