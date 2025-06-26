const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

/**
 * Send email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 * @returns {Promise} - Email send result
 */
const sendEmail = async (options) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured. Email not sent.');
      return { success: false, message: 'SMTP not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"DT Vehicles Management" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send expiry notification email for vehicles
 * @param {Object} vehicle - Vehicle object
 * @param {Array} alerts - Array of expiry alerts
 * @param {string} recipientEmail - Recipient email address
 * @returns {Promise} - Email send result
 */
const sendExpiryNotification = async (vehicle, alerts, recipientEmail) => {
  try {
    // Categorize alerts by priority
    const expiredAlerts = alerts.filter(alert => alert.priority === 'expired');
    const highPriorityAlerts = alerts.filter(alert => alert.priority === 'high');
    const mediumPriorityAlerts = alerts.filter(alert => alert.priority === 'medium');
    const lowPriorityAlerts = alerts.filter(alert => alert.priority === 'low');

    // Generate alert list HTML
    const generateAlertList = (alertList, title, color) => {
      if (alertList.length === 0) return '';
      
      return `
        <h3 style="color: ${color}; margin-bottom: 10px;">${title}</h3>
        <ul style="margin-bottom: 20px;">
          ${alertList.map(alert => `
            <li style="margin-bottom: 5px;">
              <strong>${alert.document}</strong>: 
              ${alert.daysRemaining < 0 ? `Expired ${Math.abs(alert.daysRemaining)} days ago` : `${alert.daysRemaining} days remaining`}
              (Due: ${new Date(alert.expiryDate).toLocaleDateString()})
            </li>
          `).join('')}
        </ul>
      `;
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Vehicle Document Expiry Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #dc2626; margin-top: 0;">🚨 Vehicle Document Expiry Alert</h1>
          <p style="font-size: 16px; margin-bottom: 0;">
            <strong>Vehicle:</strong> ${vehicle.vehicleNumber} - ${vehicle.displayName || vehicle.modelMake}<br>
            <strong>Department:</strong> ${vehicle.department}<br>
            <strong>Alert Date:</strong> ${new Date().toLocaleDateString()}
          </p>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #374151; margin-top: 0;">Document Status Summary</h2>
          
          ${generateAlertList(expiredAlerts, 'EXPIRED', '#dc2626')}
          ${generateAlertList(highPriorityAlerts, 'HIGH PRIORITY (≤7 days)', '#ea580c')}
          ${generateAlertList(mediumPriorityAlerts, 'MEDIUM PRIORITY (≤15 days)', '#d97706')}
          ${generateAlertList(lowPriorityAlerts, 'LOW PRIORITY (≤30 days)', '#059669')}

          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin-top: 20px;">
            <h3 style="color: #92400e; margin-top: 0;">Action Required</h3>
            <p style="margin-bottom: 0; color: #92400e;">
              Please take immediate action to renew the expired/expiring documents for vehicle <strong>${vehicle.vehicleNumber}</strong>.
              Contact the relevant authorities or service providers to ensure compliance and avoid penalties.
            </p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">
              This is an automated notification from the Deep Tec Engineering Vehicle Management System.
              Please do not reply to this email. For assistance, contact the system administrator.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
VEHICLE DOCUMENT EXPIRY ALERT

Vehicle: ${vehicle.vehicleNumber} - ${vehicle.displayName || vehicle.modelMake}
Department: ${vehicle.department}
Alert Date: ${new Date().toLocaleDateString()}

DOCUMENT STATUS:
${alerts.map(alert => `
- ${alert.document}: ${alert.daysRemaining < 0 ? `Expired ${Math.abs(alert.daysRemaining)} days ago` : `${alert.daysRemaining} days remaining`} (Due: ${new Date(alert.expiryDate).toLocaleDateString()})
`).join('')}

ACTION REQUIRED:
Please take immediate action to renew the expired/expiring documents for vehicle ${vehicle.vehicleNumber}.

This is an automated notification from the Deep Tec Engineering Vehicle Management System.
    `;

    const subject = `🚨 Vehicle Alert: ${vehicle.vehicleNumber} - ${expiredAlerts.length > 0 ? 'EXPIRED' : 'EXPIRING'} Documents`;

    return await sendEmail({
      to: recipientEmail,
      subject: subject,
      text: textContent,
      html: htmlContent
    });

  } catch (error) {
    console.error('Error sending expiry notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send weekly/monthly summary report
 * @param {Array} vehicles - Array of vehicles with alerts
 * @param {Array} recipientEmails - Array of recipient email addresses
 * @param {string} reportType - Type of report ('weekly' or 'monthly')
 * @returns {Promise} - Email send result
 */
const sendSummaryReport = async (vehicles, recipientEmails, reportType = 'weekly') => {
  try {
    // Categorize vehicles
    const expiredVehicles = vehicles.filter(v => v.getExpiryAlerts().some(alert => alert.priority === 'expired'));
    const expiringVehicles = vehicles.filter(v => v.getExpiryAlerts().some(alert => ['high', 'medium', 'low'].includes(alert.priority)));

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Vehicle Report</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1f2937; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
          <h1 style="margin: 0;">Deep Tec Engineering</h1>
          <h2 style="margin: 10px 0 0 0;">${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Vehicle Report</h2>
          <p style="margin: 5px 0 0 0; opacity: 0.8;">Report Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #fecaca;">
            <h3 style="color: #dc2626; margin: 0;">Expired</h3>
            <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 5px 0;">${expiredVehicles.length}</p>
          </div>
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #fde68a;">
            <h3 style="color: #d97706; margin: 0;">Expiring Soon</h3>
            <p style="font-size: 24px; font-weight: bold; color: #d97706; margin: 5px 0;">${expiringVehicles.length}</p>
          </div>
          <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #bbf7d0;">
            <h3 style="color: #16a34a; margin: 0;">Total Vehicles</h3>
            <p style="font-size: 24px; font-weight: bold; color: #16a34a; margin: 5px 0;">${vehicles.length}</p>
          </div>
        </div>

        ${expiredVehicles.length > 0 ? `
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin-bottom: 20px;">
          <h3 style="color: #dc2626; margin-top: 0;">⚠️ EXPIRED DOCUMENTS</h3>
          ${expiredVehicles.map(vehicle => `
            <div style="margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px;">
              <strong>${vehicle.vehicleNumber}</strong> - ${vehicle.displayName || vehicle.modelMake} (${vehicle.department})
              <ul style="margin: 5px 0;">
                ${vehicle.getExpiryAlerts().filter(alert => alert.priority === 'expired').map(alert => `
                  <li>${alert.document}: Expired ${Math.abs(alert.daysRemaining)} days ago</li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; text-align: center;">
          <p>This is an automated report from the Deep Tec Engineering Vehicle Management System.</p>
          <p>For questions or support, contact the system administrator.</p>
        </div>
      </body>
      </html>
    `;

    const subject = `📊 Deep Tec Vehicle ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report - ${new Date().toLocaleDateString()}`;

    const results = [];
    for (const email of recipientEmails) {
      const result = await sendEmail({
        to: email,
        subject: subject,
        html: htmlContent
      });
      results.push(result);
    }

    console.log(`${reportType} summary report sent to ${recipientEmails.length} recipients`);
    return { success: true, recipientCount: recipientEmails.length, results };

  } catch (error) {
    console.error(`Error sending ${reportType} summary report:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Send maintenance reminder email
 * @param {Object} maintenance - Maintenance record
 * @param {Object} vehicle - Vehicle details
 * @param {Object} mechanic - Mechanic details
 * @returns {Promise} - Email send result
 */
const sendMaintenanceReminder = async (maintenance, vehicle, mechanic) => {
  const subject = `Maintenance Reminder: ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Maintenance Reminder</h2>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #555; margin-top: 0;">Vehicle Information</h3>
        <p><strong>Vehicle:</strong> ${vehicle.year} ${vehicle.make} ${vehicle.model}</p>
        <p><strong>License Plate:</strong> ${vehicle.licensePlate}</p>
        <p><strong>VIN:</strong> ${vehicle.vin}</p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">Maintenance Details</h3>
        <p><strong>Type:</strong> ${maintenance.type}</p>
        <p><strong>Category:</strong> ${maintenance.category}</p>
        <p><strong>Description:</strong> ${maintenance.description}</p>
        <p><strong>Scheduled Date:</strong> ${new Date(maintenance.scheduledDate).toLocaleDateString()}</p>
        <p><strong>Priority:</strong> ${maintenance.priority}</p>
      </div>
      
      <p style="color: #666;">
        Please ensure this maintenance is completed on time to keep the vehicle in optimal condition.
      </p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #999;">
        This is an automated email from DT Vehicles Management System.
      </p>
    </div>
  `;

  const text = `
    Maintenance Reminder
    
    Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}
    License Plate: ${vehicle.licensePlate}
    VIN: ${vehicle.vin}
    
    Maintenance Details:
    Type: ${maintenance.type}
    Category: ${maintenance.category}
    Description: ${maintenance.description}
    Scheduled Date: ${new Date(maintenance.scheduledDate).toLocaleDateString()}
    Priority: ${maintenance.priority}
    
    Please ensure this maintenance is completed on time to keep the vehicle in optimal condition.
  `;

  return sendEmail({
    to: mechanic.email,
    subject,
    html,
    text
  });
};

/**
 * Send overdue maintenance notification
 * @param {Object} maintenance - Maintenance record
 * @param {Object} vehicle - Vehicle details
 * @param {Object} recipients - Array of recipient emails
 * @returns {Promise} - Email send result
 */
const sendOverdueMaintenanceNotification = async (maintenance, vehicle, recipients) => {
  const subject = `OVERDUE: Maintenance for ${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc3545;">⚠️ OVERDUE MAINTENANCE</h2>
      
      <div style="background-color: #f8d7da; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
        <h3 style="color: #721c24; margin-top: 0;">Vehicle Information</h3>
        <p><strong>Vehicle:</strong> ${vehicle.year} ${vehicle.make} ${vehicle.model}</p>
        <p><strong>License Plate:</strong> ${vehicle.licensePlate}</p>
        <p><strong>VIN:</strong> ${vehicle.vin}</p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">Maintenance Details</h3>
        <p><strong>Type:</strong> ${maintenance.type}</p>
        <p><strong>Category:</strong> ${maintenance.category}</p>
        <p><strong>Description:</strong> ${maintenance.description}</p>
        <p><strong>Scheduled Date:</strong> ${new Date(maintenance.scheduledDate).toLocaleDateString()}</p>
        <p><strong>Priority:</strong> ${maintenance.priority}</p>
        <p><strong>Days Overdue:</strong> ${Math.ceil((new Date() - new Date(maintenance.scheduledDate)) / (1000 * 60 * 60 * 24))}</p>
      </div>
      
      <p style="color: #721c24; font-weight: bold;">
        This maintenance is overdue and requires immediate attention!
      </p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="font-size: 12px; color: #999;">
        This is an automated email from DT Vehicles Management System.
      </p>
    </div>
  `;

  const text = `
    ⚠️ OVERDUE MAINTENANCE
    
    Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}
    License Plate: ${vehicle.licensePlate}
    VIN: ${vehicle.vin}
    
    Maintenance Details:
    Type: ${maintenance.type}
    Category: ${maintenance.category}
    Description: ${maintenance.description}
    Scheduled Date: ${new Date(maintenance.scheduledDate).toLocaleDateString()}
    Priority: ${maintenance.priority}
    Days Overdue: ${Math.ceil((new Date() - new Date(maintenance.scheduledDate)) / (1000 * 60 * 60 * 24))}
    
    This maintenance is overdue and requires immediate attention!
  `;

  // Send to all recipients
  const promises = recipients.map(email => 
    sendEmail({
      to: email,
      subject,
      html,
      text
    })
  );

  return Promise.all(promises);
};

/**
 * Send user account notification
 * @param {Object} user - User details
 * @param {string} type - Notification type ('created', 'updated', 'deactivated')
 * @returns {Promise} - Email send result
 */
const sendUserAccountNotification = async (user, type) => {
  let subject, html, text;

  switch (type) {
    case 'created':
      subject = 'Welcome to DT Vehicles Management System';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Welcome to DT Vehicles Management!</h2>
          
          <p>Hello ${user.firstName} ${user.lastName},</p>
          
          <p>Your account has been created successfully. Here are your account details:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Employee ID:</strong> ${user.employeeId}</p>
            <p><strong>Role:</strong> ${user.role}</p>
            <p><strong>Department:</strong> ${user.department}</p>
          </div>
          
          <p>You can now log in to the system using your email and password.</p>
          
          <p>If you have any questions, please contact your system administrator.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #999;">
            This is an automated email from DT Vehicles Management System.
          </p>
        </div>
      `;
      text = `
        Welcome to DT Vehicles Management!
        
        Hello ${user.firstName} ${user.lastName},
        
        Your account has been created successfully. Here are your account details:
        
        Email: ${user.email}
        Employee ID: ${user.employeeId}
        Role: ${user.role}
        Department: ${user.department}
        
        You can now log in to the system using your email and password.
        
        If you have any questions, please contact your system administrator.
      `;
      break;

    case 'updated':
      subject = 'Your Account Has Been Updated';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">Account Update Notification</h2>
          
          <p>Hello ${user.firstName} ${user.lastName},</p>
          
          <p>Your account details have been updated. If you did not request this change, please contact your system administrator immediately.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #999;">
            This is an automated email from DT Vehicles Management System.
          </p>
        </div>
      `;
      text = `
        Account Update Notification
        
        Hello ${user.firstName} ${user.lastName},
        
        Your account details have been updated. If you did not request this change, please contact your system administrator immediately.
      `;
      break;

    case 'deactivated':
      subject = 'Your Account Has Been Deactivated';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Account Deactivation Notice</h2>
          
          <p>Hello ${user.firstName} ${user.lastName},</p>
          
          <p>Your account has been deactivated. You will no longer be able to access the DT Vehicles Management System.</p>
          
          <p>If you believe this is an error, please contact your system administrator.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #999;">
            This is an automated email from DT Vehicles Management System.
          </p>
        </div>
      `;
      text = `
        Account Deactivation Notice
        
        Hello ${user.firstName} ${user.lastName},
        
        Your account has been deactivated. You will no longer be able to access the DT Vehicles Management System.
        
        If you believe this is an error, please contact your system administrator.
      `;
      break;

    default:
      return { success: false, error: 'Invalid notification type' };
  }

  return sendEmail({
    to: user.email,
    subject,
    html,
    text
  });
};

module.exports = {
  sendEmail,
  sendMaintenanceReminder,
  sendOverdueMaintenanceNotification,
  sendUserAccountNotification,
  sendExpiryNotification,
  sendSummaryReport
};
