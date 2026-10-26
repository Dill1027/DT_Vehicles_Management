const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
const { Types } = require('mongoose');
const { allowRoles } = require('../middleware/auth');
const { createThumbnail } = require('../utils/thumbnail');
const { auditedWrite, VEHICLE_FIELDS } = require('../utils/audit');
const { withDeadline } = require('../utils/withDeadline');
const { createCachedImageLoader } = require('../utils/cachedImageLoader');
const { uploadMultipleImages, handleMulterError, getFileUrl } = require('../middleware/upload');

// Enforce permissions for every write route, including legacy upload/report routes.
router.use((req, res, next) => {
  if (['GET', 'HEAD'].includes(req.method)) return next();
  const archiveAction = req.method === 'DELETE' || /\/(archive|restore)$/.test(req.path);
  return allowRoles(...(archiveAction ? ['admin'] : ['admin', 'editor']))(req, res, next);
});
function sanitizeVehicleBody(req, res, next) {
  if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const fields = ['vehicleNumber', 'make', 'model', 'modelMake', 'year', 'type', 'department', 'assignedTo', 'assignedDriver', 'insuranceDetails', 'insuranceExpiry', 'licenseExpiry', 'emissionExpiry', 'revenueExpiry', 'registrationExpiry', 'purchaseDate', 'purchasePrice', 'leaseDue', 'leaseProvider', 'mileage', 'monthStartMileage', 'monthEndMileage', 'monthlyMileage', 'fuelType', 'engineCapacity', 'serviceDate', 'nextServiceDue', 'lastMaintenanceDate', 'nextMaintenanceDate', 'tyreBatteryHistory', 'maintenanceNotes', 'status', 'condition', 'imageUrl', 'vehicleImages', 'images', 'documents', 'notes', 'replaceImages'];
    req.body = Object.fromEntries(Object.entries(req.body).filter(([key]) => fields.includes(key)));
  }
  next();
}
router.use(sanitizeVehicleBody);

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const archived = req.query.archived === 'true';
    if (archived && req.user.role !== 'admin') return res.status(403).json({ message: 'Only administrators can access the archive.' });
    // Do not transfer every full-resolution base64 photo with the fleet list.
    const vehicles = await withDeadline(Vehicle.aggregate([
      { $match: { archivedAt: archived ? { $ne: null } : null } },
      { $addFields: { hasImage: { $or: [
        { $gt: [{ $size: { $ifNull: ['$vehicleImages', []] } }, 0] },
        { $ne: [{ $ifNull: ['$imageUrl', ''] }, ''] }
      ] } } },
      { $project: { vehicleImages: 0, imageUrl: 0, images: 0, documents: 0, notifications: 0, thumbnailData: 0, operationsVersion: 0 } }
    ]).option({ maxTimeMS: 8000, includeArchived: archived }).exec(), 12000);
    console.log(`Retrieved ${vehicles.length} vehicles from database`);
    res.json({
      success: true,
      data: vehicles
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    const unavailable = /Mongo.*(Network|ServerSelection|WaitQueue|OperationTimeout)|MongooseServerSelection/.test(error.name) || error.code === 50;
    if (unavailable) res.set('Retry-After', '5');
    res.status(unavailable ? 503 : 500).json({
      success: false,
      message: unavailable ? 'Database temporarily unavailable. Please try again shortly.' : 'Error fetching vehicles'
    });
  }
});

// Decode each original only once per version; at most two database reads at a time.
const createVehicleImageReader = connect => createCachedImageLoader(async key => {
  await connect();
  const id = key.split(':')[0];
  const [vehicle] = await withDeadline(Vehicle.aggregate([
    { $match: { _id: new Types.ObjectId(id) } },
    { $project: { updatedAt: 1, thumbnailData: 1, source: { $ifNull: ['$thumbnailData', { $ifNull: [{ $arrayElemAt: ['$vehicleImages', 0] }, '$imageUrl'] }] } } }
  ]).option({ maxTimeMS: 8000, readPreference: 'secondaryPreferred', includeArchived: key.endsWith(':admin') }).exec(), 30000);
  let source = vehicle?.thumbnailData || vehicle?.source;
  if (!source) return null;
  if (!vehicle.thumbnailData) {
    const thumbnail = await createThumbnail(source);
    if (thumbnail) {
      Vehicle.updateOne({ _id: new Types.ObjectId(id), updatedAt: vehicle.updatedAt }, { $set: { thumbnailData: thumbnail } }, { timestamps: false }).catch(error => console.warn('Thumbnail persistence delayed:', error.name));
      source = thumbnail;
    }
  }
  const data = /^data:(image\/(?:jpeg|jpg|png|gif|webp|avif|heic|heif|bmp|tiff));base64,([A-Za-z0-9+/=\r\n]+)$/.exec(source);
  if (data) return { mime: data[1], body: Buffer.from(data[2], 'base64') };
  if (/^https?:\/\//i.test(source) || source.startsWith('/uploads/')) return { redirect: source };
  return null;
});

router.get('/:id/image', async (req, res) => {
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  try {
    if (!Types.ObjectId.isValid(req.params.id)) return res.status(400).end();
    const version = String(req.query.v || '').slice(0, 100);
    // Cache hits remain available even during a temporary Atlas outage.
    req.app.locals.readVehicleImage ||= createVehicleImageReader(req.app.locals.connectToDatabase);
    const image = await req.app.locals.readVehicleImage(`${req.params.id}:${version}:${req.user.role === 'admin' ? 'admin' : 'active'}`);
    if (!image) return res.status(404).end();
    if (image.redirect) return res.redirect(image.redirect);
    res.set('Cache-Control', 'private, max-age=300');
    return res.type(image.mime).send(image.body);
  } catch (error) {
    console.error('Vehicle photo unavailable:', error.name);
    res.set('Cache-Control', 'no-store');
    res.set('Retry-After', '5');
    return res.status(503).end();
  }
});

// Get vehicle statistics (move this before /:id route)
router.get('/stats', async (req, res) => {
  try {
    const total = await Vehicle.countDocuments();
    const statusStats = await Vehicle.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const typeStats = await Vehicle.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    
    // Count vehicles with upcoming expiries (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const upcomingInsuranceExpiry = await Vehicle.countDocuments({
      insuranceExpiry: { $lte: thirtyDaysFromNow, $gte: new Date() }
    });
    
    const upcomingEmissionExpiry = await Vehicle.countDocuments({
      emissionExpiry: { $lte: thirtyDaysFromNow, $gte: new Date() }
    });
    
    const upcomingRevenueExpiry = await Vehicle.countDocuments({
      revenueExpiry: { $lte: thirtyDaysFromNow, $gte: new Date() }
    });

    // Calculate status counts
    const available = statusStats.find(s => s._id === 'available')?.count || 0;
    const inUse = statusStats.find(s => s._id === 'in-use')?.count || 0;
    const maintenance = statusStats.find(s => s._id === 'maintenance')?.count || 0;

    res.json({
      success: true,
      data: {
        total,
        available,
        inUse,
        maintenance,
        statusStats,
        typeStats,
        upcomingExpirations: {
          insurance: upcomingInsuranceExpiry,
          emission: upcomingEmissionExpiry,
          revenue: upcomingRevenueExpiry
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Error fetching vehicle statistics'
    });
  }
});

// Add missing expiring vehicles endpoint
router.get('/expiring', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const vehicles = await Vehicle.getExpiringVehicles(days);
    
    const vehiclesWithAlerts = vehicles.map(vehicle => ({
      ...vehicle.toObject(),
      alerts: vehicle.getExpiryAlerts(),
      nearestExpiryDays: Math.min(
        ...vehicle.getExpiryAlerts().map(alert => alert.daysUntilExpiry)
      ),
      expiringDocuments: vehicle.getExpiryAlerts().filter(alert => alert.daysUntilExpiry > 0)
    }));

    res.json({
      success: true,
      data: vehiclesWithAlerts,
      count: vehiclesWithAlerts.length,
      message: `Found ${vehiclesWithAlerts.length} vehicles with documents expiring in ${days} days`
    });
  } catch (error) {
    console.error('Error fetching expiring vehicles:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Error fetching expiring vehicles'
    });
  }
});

// Add missing expired vehicles endpoint
router.get('/expired', async (req, res) => {
  try {
    const vehicles = await Vehicle.getExpiredVehicles();
    
    const vehiclesWithAlerts = vehicles.map(vehicle => ({
      ...vehicle.toObject(),
      alerts: vehicle.getExpiryAlerts().filter(alert => alert.priority === 'expired'),
      expiredDocuments: vehicle.getExpiryAlerts().filter(alert => alert.priority === 'expired')
    }));

    res.json({
      success: true,
      data: vehiclesWithAlerts,
      count: vehiclesWithAlerts.length,
      message: `Found ${vehiclesWithAlerts.length} vehicles with expired documents`
    });
  } catch (error) {
    console.error('Error fetching expired vehicles:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Error fetching expired vehicles'
    });
  }
});

// Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).setOptions({ includeArchived: req.user.role === 'admin' });
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Error fetching vehicle'
    });
  }
});

// Create new vehicle
router.post('/', async (req, res) => {
  try {
    req.body.createdBy = req.user._id;
    req.body.updatedBy = req.user._id;
    req.body.thumbnailData = await createThumbnail(req.body.vehicleImages?.[0] || req.body.imageUrl);
    const vehicle = new Vehicle(req.body);
    const savedVehicle = await auditedWrite(req.user, 'vehicle.created', 'vehicle', async session => {
      const document = new Vehicle(vehicle.toObject());
      await document.save({ session });
      return { document };
    });
    console.log('Vehicle saved successfully:', savedVehicle._id);
    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: savedVehicle
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this vehicle number already exists',
        error: error.message
      });
    }
    res.status(error.status || 500).json({
      success: false,
      message: 'Error creating vehicle',
      error: error.message
    });
  }
});

// Create new vehicle with multiple images support
router.post('/with-images', uploadMultipleImages, handleMulterError, sanitizeVehicleBody, async (req, res) => {
  try {
    console.log('Creating new vehicle with images:', {
      body: req.body,
      filesCount: req.files ? req.files.length : 0
    });

    // Process uploaded images
    const vehicleImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const imageUrl = getFileUrl(req, file.path);
        vehicleImages.push({
          url: imageUrl,
          description: `Vehicle Image ${index + 1}`,
          uploadDate: new Date()
        });
      });
    }

    // Create vehicle data with images
    const vehicleData = {
      ...req.body,
      images: vehicleImages,
      vehicleImages: vehicleImages.map(img => img.url), // For backward compatibility
      imageUrl: vehicleImages.length > 0 ? vehicleImages[0].url : undefined // Primary image
    };

    vehicleData.createdBy = req.user._id;
    vehicleData.updatedBy = req.user._id;
    vehicleData.thumbnailData = await createThumbnail(vehicleData.vehicleImages?.[0] || vehicleData.imageUrl);
    const vehicle = new Vehicle(vehicleData);
    const savedVehicle = await auditedWrite(req.user, 'vehicle.created', 'vehicle', async session => {
      const document = new Vehicle(vehicle.toObject());
      await document.save({ session });
      return { document };
    });
    
    console.log('Vehicle with images saved successfully:', {
      id: savedVehicle._id,
      imagesCount: savedVehicle.images.length
    });

    res.status(201).json({
      success: true,
      message: `Vehicle created successfully with ${vehicleImages.length} image(s)`,
      data: savedVehicle
    });
  } catch (error) {
    console.error('Error creating vehicle with images:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this vehicle number already exists',
        error: error.message
      });
    }
    
    res.status(error.status || 500).json({
      success: false,
      message: 'Error creating vehicle with images',
      error: error.message
    });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  try {
    req.body.updatedBy = req.user._id;
    if ('vehicleImages' in req.body || 'imageUrl' in req.body) req.body.thumbnailData = await createThumbnail(req.body.vehicleImages?.[0] || req.body.imageUrl);
    const updated = await auditedWrite(req.user, 'vehicle.updated', 'vehicle', async session => {
      const before = await Vehicle.findById(req.params.id).select(VEHICLE_FIELDS.join(' ')).session(session).lean();
      const document = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true, session });
      return { document, before };
    });
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(error.status || 500).json({
      success: false,
      message: 'Error updating vehicle'
    });
  }
});

// Update vehicle with multiple images support
router.put('/:id/with-images', uploadMultipleImages, handleMulterError, sanitizeVehicleBody, async (req, res) => {
  try {
    console.log('Updating vehicle with images:', {
      vehicleId: req.params.id,
      body: req.body,
      filesCount: req.files ? req.files.length : 0
    });

    // Get existing vehicle
    const existingVehicle = await Vehicle.findById(req.params.id);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    // Process new uploaded images
    const newImages = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const imageUrl = getFileUrl(req, file.path);
        newImages.push({
          url: imageUrl,
          description: `Vehicle Image ${index + 1}`,
          uploadDate: new Date()
        });
      });
    }

    // Determine how to handle images based on request
    let updatedImages = existingVehicle.images || [];

    if (req.body.replaceImages === 'true' || req.body.replaceImages === true) {
      // Replace all existing images with new ones
      updatedImages = newImages;
      updatedVehicleImages = newImages.map(img => img.url);
      primaryImageUrl = newImages.length > 0 ? newImages[0].url : undefined;
    } else {
      // Add new images to existing ones (max 3 total)
      const combinedImages = [...updatedImages, ...newImages];
      updatedImages = combinedImages.slice(0, 3); // Keep only first 3
      updatedVehicleImages = updatedImages.map(img => img.url);
      primaryImageUrl = updatedImages.length > 0 ? updatedImages[0].url : undefined;
    }

    // Update vehicle data
    const updateData = {
      ...req.body,
      images: updatedImages,
      vehicleImages: updatedVehicleImages,
      imageUrl: primaryImageUrl
    };

    updateData.updatedBy = req.user._id;
    updateData.thumbnailData = await createThumbnail(updateData.vehicleImages?.[0] || updateData.imageUrl);

    // Remove the replaceImages flag from the data to save
    delete updateData.replaceImages;

    const updated = await auditedWrite(req.user, 'vehicle.updated', 'vehicle', async session => {
      const before = await Vehicle.findById(req.params.id).select(VEHICLE_FIELDS.join(' ')).session(session).lean();
      const document = await Vehicle.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true, session });
      return { document, before };
    });

    console.log('Vehicle with images updated successfully:', {
      id: updated._id,
      imagesCount: updated.images.length
    });

    res.json({
      success: true,
      message: `Vehicle updated successfully with ${updatedImages.length} image(s)`,
      data: updated
    });
  } catch (error) {
    console.error('Error updating vehicle with images:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this vehicle number already exists',
        error: error.message
      });
    }
    
    res.status(error.status || 500).json({
      success: false,
      message: 'Error updating vehicle with images',
      error: error.message
    });
  }
});

// Preserve vehicle history; permanent deletion is not exposed.
async function archiveVehicle(req, res) {
  try {
    const vehicle = await auditedWrite(req.user, 'vehicle.archived', 'vehicle', async session => {
      const before = await Vehicle.findById(req.params.id).select(VEHICLE_FIELDS.join(' ')).session(session).lean();
      const document = await Vehicle.findOneAndUpdate({ _id: req.params.id, archivedAt: null }, { $set: { archivedAt: new Date(), archivedBy: req.user._id, updatedBy: req.user._id } }, { new: true, session }).select(VEHICLE_FIELDS.join(' '));
      return { document, before };
    });
    if (!vehicle) return res.status(404).json({ message: 'Active vehicle not found.' });
    req.app.locals.readVehicleImage = undefined;
    return res.json({ success: true, message: 'Vehicle archived.' });
  } catch (error) { return res.status(error.status || 400).json({ message: error.status ? error.message : 'Unable to archive vehicle.' }); }
}
router.delete('/:id', archiveVehicle);
router.patch('/:id/archive', archiveVehicle);
router.patch('/:id/restore', async (req, res) => {
  try {
    const vehicle = await auditedWrite(req.user, 'vehicle.restored', 'vehicle', async session => {
      const before = await Vehicle.findById(req.params.id).select(VEHICLE_FIELDS.join(' ')).setOptions({ includeArchived: true }).session(session).lean();
      const document = await Vehicle.findOneAndUpdate({ _id: req.params.id, archivedAt: { $ne: null } }, { $set: { archivedAt: null, archivedBy: null, updatedBy: req.user._id } }, { new: true, includeArchived: true, session }).select(VEHICLE_FIELDS.join(' '));
      return { document, before };
    });
    if (!vehicle) return res.status(404).json({ message: 'Archived vehicle not found.' });
    req.app.locals.readVehicleImage = undefined;
    return res.json({ success: true, message: 'Vehicle restored.' });
  } catch (error) { return res.status(error.status || 400).json({ message: error.status ? error.message : 'Unable to restore vehicle.' }); }
});

// Manual trigger for notification check (for testing)
router.post('/notifications/trigger', async (req, res) => {
  try {
    const { days = 30 } = req.body;
    const notificationService = require('../services/notificationService');
    
    const result = await notificationService.triggerManualNotificationCheck(days);
    
    res.json({
      success: true,
      data: result,
      message: `Notification check completed for ${days} days ahead`
    });
  } catch (error) {
    console.error('Error triggering notifications:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Error triggering notifications'
    });
  }
});

// Send weekly summary report manually
router.post('/reports/weekly', async (req, res) => {
  try {
    const notificationService = require('../services/notificationService');
    const result = await notificationService.sendWeeklySummaryReport();
    
    res.json({
      success: true,
      data: result,
      message: 'Weekly summary report sent successfully'
    });
  } catch (error) {
    console.error('Error sending weekly report:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Error sending weekly report'
    });
  }
});

// Send monthly summary report manually
router.post('/reports/monthly', async (req, res) => {
  try {
    const notificationService = require('../services/notificationService');
    const result = await notificationService.sendMonthlySummaryReport();
    
    res.json({
      success: true,
      data: result,
      message: 'Monthly summary report sent successfully'
    });
  } catch (error) {
    console.error('Error sending monthly report:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Error sending monthly report'
    });
  }
});

// Generate PDF reports
router.get('/reports/pdf/summary', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    const PDFReportGenerator = require('../utils/pdfGenerator');
    const generator = new PDFReportGenerator();
    
    const pdfBuffer = await generator.generateVehicleSummaryReport(vehicles);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="vehicle-summary-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating vehicle summary PDF:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Error generating PDF report'
    });
  }
});

router.get('/reports/pdf/expiry-alerts', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const vehicles = await Vehicle.getExpiringVehicles(days);
    const PDFReportGenerator = require('../utils/pdfGenerator');
    const generator = new PDFReportGenerator();
    
    const pdfBuffer = await generator.generateExpiryAlertsReport(vehicles);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="expiry-alerts-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating expiry alerts PDF:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Error generating PDF report'
    });
  }
});

router.get('/reports/pdf/maintenance', async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    const PDFReportGenerator = require('../utils/pdfGenerator');
    const generator = new PDFReportGenerator();
    
    const pdfBuffer = await generator.generateMaintenanceReport(vehicles);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="maintenance-report-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating maintenance PDF:', error);
    res.status(error.status || 500).json({
      success: false,
      message: 'Error generating PDF report'
    });
  }
});

module.exports = router;
