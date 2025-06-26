# Deep Tec Vehicle Management System - Enhanced Integration Guide

## Overview

The Deep Tec Vehicle Management System has been enhanced with comprehensive features for document expiry tracking, automated notifications, role-based access control, and PDF reporting. This guide covers the implementation details and how to use the system effectively.

## 🚀 New Features Implemented

### 1. Enhanced Vehicle Model
- **Comprehensive document tracking**: Insurance, emission, revenue license, registration expiries
- **Maintenance scheduling**: Next service due dates, maintenance history
- **Notification tracking**: History of sent alerts and methods
- **Department-specific fields**: Tailored for Deep Tec's organizational structure
- **Virtual fields**: Calculated properties for days until expiry, alert priorities

### 2. Automated Notification System
- **Scheduled notifications**: Daily checks at 9:00 AM Sri Lanka time
- **Priority-based alerts**: 30/15/7 days before expiry with different priority levels
- **Email notifications**: Rich HTML emails with company branding
- **Department-specific routing**: Notifications sent to relevant department emails
- **Summary reports**: Weekly (Friday 5 PM) and monthly (1st of month 10 AM) reports

### 3. Role-Based Access Control
- **Four user roles**: Admin, Fleet Manager, Staff, Driver
- **Permission-based authorization**: Granular control over actions
- **Department restrictions**: Users can only access their department's data (except admins)
- **Secure authentication**: JWT tokens with proper validation

### 4. PDF Report Generation
- **Vehicle Summary Reports**: Complete fleet overview with statistics
- **Expiry Alerts Reports**: Categorized by priority levels
- **Maintenance Reports**: Scheduled and overdue maintenance tracking
- **Professional formatting**: Deep Tec branding and structured layout

## 📁 Project Structure

```
server/
├── models/
│   ├── Vehicle.js          # Enhanced vehicle model with expiry tracking
│   ├── User.js             # User model with role-based permissions
│   └── Notification.js     # Notification tracking model
├── routes/
│   ├── vehicleRoutes.js    # Protected vehicle routes with auth
│   ├── userRoutes.js       # User management routes
│   └── authRoutes.js       # Authentication routes
├── middleware/
│   └── auth.js             # Authentication and authorization middleware
├── services/
│   └── notificationService.js  # Automated notification scheduler
├── utils/
│   ├── email.js            # Email sending utilities
│   ├── pdfGenerator.js     # PDF report generation
│   └── helpers.js          # General utility functions
└── server.js               # Main application entry point
```

## 🛠️ Setup and Configuration

### 1. Environment Variables

Update your `.env` file with the required configuration:

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dt_vehicles

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# Notification Recipients
ADMIN_EMAIL=admin@deeptec.com
FLEET_MANAGER_EMAIL=fleet@deeptec.com

# Department Emails
ENGINEERING_EMAIL=engineering@deeptec.com
OPERATIONS_EMAIL=operations@deeptec.com
ADMINISTRATION_EMAIL=admin@deeptec.com
SALES_EMAIL=sales@deeptec.com
MAINTENANCE_EMAIL=maintenance@deeptec.com
EXECUTIVE_EMAIL=executive@deeptec.com
```

### 2. Installation

```bash
# Install new dependencies
cd server
npm install nodemailer node-cron pdfkit bcryptjs jsonwebtoken

# Start the server
npm run dev
```

## 🔐 Authentication & Authorization

### User Roles and Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access - all vehicles, users, reports, exports |
| **Fleet Manager** | Vehicle management, reports, notifications (all departments) |
| **Staff** | View and edit vehicles, view reports (own department) |
| **Driver** | View vehicles only (own department) |

### API Authentication

All protected routes require authentication:

```javascript
// Headers
Authorization: Bearer your_jwt_token_here

// Example authenticated request
fetch('/api/vehicles', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## 📧 Notification System

### Automated Schedules

The notification system runs on the following schedule:

- **Daily Expiry Check**: 9:00 AM - Checks for documents expiring in 30 days
- **Weekly Priority Check**: Monday 8:00 AM - Checks for documents expiring in 7 days
- **Weekly Reports**: Friday 5:00 PM - Summary report to management
- **Monthly Reports**: 1st of month 10:00 AM - Comprehensive report to all departments

### Manual Triggers

You can manually trigger notifications for testing:

```bash
# Trigger notification check
POST /api/vehicles/notifications/trigger
{
  "days": 30
}

# Send weekly report
POST /api/vehicles/reports/weekly

# Send monthly report
POST /api/vehicles/reports/monthly
```

## 📊 PDF Reports

### Available Reports

1. **Vehicle Summary Report**
   - `GET /api/vehicles/reports/pdf/summary`
   - Complete fleet overview with statistics
   - Requires `reports.export` permission

2. **Expiry Alerts Report**
   - `GET /api/vehicles/reports/pdf/expiry-alerts?days=30`
   - Categorized by priority levels
   - Requires `reports.export` permission

3. **Maintenance Report**
   - `GET /api/vehicles/reports/pdf/maintenance`
   - Scheduled and overdue maintenance
   - Requires `reports.export` permission

### Frontend Integration

```javascript
// Download PDF report
const downloadReport = async (reportType) => {
  try {
    const response = await fetch(`/api/vehicles/reports/pdf/${reportType}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
    a.click();
  } catch (error) {
    console.error('Error downloading report:', error);
  }
};
```

## 🚗 Vehicle Management

### Enhanced Vehicle Model

The vehicle model now includes comprehensive tracking:

```javascript
// Example vehicle object
{
  vehicleNumber: "DT-001",
  make: "Toyota",
  model: "Hilux",
  year: 2022,
  type: "Pickup",
  department: "Engineering",
  
  // Legal documents
  insuranceDetails: "Ceylinco Insurance - Policy ABC123",
  insuranceExpiry: "2024-12-31",
  emissionExpiry: "2024-06-30", 
  revenueExpiry: "2024-08-15",
  
  // Maintenance
  lastMaintenanceDate: "2024-01-15",
  nextMaintenanceDate: "2024-07-15",
  
  // Status
  status: "Active",
  condition: "Good"
}
```

### API Endpoints

```bash
# Get vehicles with alerts
GET /api/vehicles/alerts/expiring?days=30
GET /api/vehicles/alerts/expired

# Vehicle CRUD (with proper authorization)
GET /api/vehicles                    # View all vehicles
GET /api/vehicles/:id               # View specific vehicle  
POST /api/vehicles                  # Create vehicle
PUT /api/vehicles/:id               # Update vehicle
DELETE /api/vehicles/:id            # Delete vehicle
```

## 🔧 Development & Testing

### Testing Notifications

1. **Set up test environment**:
   - Use Ethereal Email for development testing
   - Configure SMTP settings in `.env`

2. **Manual notification testing**:
   ```bash
   POST /api/vehicles/notifications/trigger
   {
     "days": 7  // Test with 7 days for immediate results
   }
   ```

3. **Check notification logs**:
   - Monitor server console for notification status
   - Check email delivery status

### Adding New Features

1. **New Vehicle Fields**:
   - Update `server/models/Vehicle.js`
   - Add to expiry alert logic if applicable
   - Update PDF report templates

2. **New User Permissions**:
   - Add to permission enum in `User.js`
   - Update role-based defaults
   - Add middleware checks in routes

3. **New Report Types**:
   - Add method to `pdfGenerator.js`
   - Create new route in `vehicleRoutes.js`
   - Add frontend integration

## 🚀 Deployment Considerations

### Production Setup

1. **Email Configuration**:
   - Use production SMTP service (SendGrid, AWS SES)
   - Set up SPF, DKIM records for delivery
   - Configure proper FROM addresses

2. **Security**:
   - Change JWT secrets in production
   - Enable HTTPS for all communications
   - Set up proper CORS policies

3. **Performance**:
   - MongoDB indexes are already configured
   - Consider Redis for caching if needed
   - Monitor notification job performance

### Monitoring

1. **Notification Success**:
   - Track email delivery rates
   - Monitor failed notification attempts
   - Set up alerts for system failures

2. **System Health**:
   - Monitor API response times
   - Track authentication failures
   - Monitor database performance

## 📱 Future Enhancements

### Planned Features

1. **Mobile App Integration**:
   - Push notifications for mobile devices
   - Mobile-specific API endpoints
   - Offline capability for drivers

2. **Advanced Analytics**:
   - Cost analysis reports
   - Fuel consumption tracking
   - Maintenance cost optimization

3. **Integration Capabilities**:
   - Government database integration
   - Service provider APIs
   - Fleet tracking systems

## 🆘 Troubleshooting

### Common Issues

1. **Email Not Sending**:
   - Check SMTP credentials in `.env`
   - Verify firewall/network settings
   - Test with Ethereal Email first

2. **Authentication Failures**:
   - Verify JWT secret configuration
   - Check token expiration settings
   - Validate user permissions

3. **PDF Generation Errors**:
   - Ensure sufficient server memory
   - Check file system permissions
   - Verify PDFKit installation

### Support Contacts

- **System Administrator**: admin@deeptec.com
- **Fleet Manager**: fleet@deeptec.com
- **Technical Support**: tech@deeptec.com

---

**Version**: 2.0.0  
**Last Updated**: June 2025  
**Author**: Deep Tec Engineering Development Team
