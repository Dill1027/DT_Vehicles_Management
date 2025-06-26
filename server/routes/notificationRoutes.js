const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all notifications for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({
      'recipients.user': req.user.id,
      sent: true
    })
    .populate('vehicle', 'vehicleNumber modelMake type')
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const total = await Notification.countDocuments({
      'recipients.user': req.user.id,
      sent: true
    });

    const unreadCount = await Notification.countDocuments({
      'recipients.user': req.user.id,
      'recipients.read': false,
      sent: true
    });

    res.json({
      notifications,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get unread notifications for the authenticated user
router.get('/unread', auth, async (req, res) => {
  try {
    const notifications = await Notification.getUnreadForUser(req.user.id);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark a notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user is a recipient
    const isRecipient = notification.recipients.some(
      r => r.user.toString() === req.user.id
    );

    if (!isRecipient) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await notification.markAsRead(req.user.id);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all notifications as read for the authenticated user
router.patch('/read-all', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      'recipients.user': req.user.id,
      'recipients.read': false
    });

    for (const notification of notifications) {
      await notification.markAsRead(req.user.id);
    }

    res.json({ 
      message: 'All notifications marked as read',
      count: notifications.length
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notification statistics (admin only)
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!['admin', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unsentCount: {
            $sum: { $cond: [{ $eq: ['$sent', false] }, 1, 0] }
          },
          highPriorityCount: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
          }
        }
      }
    ]);

    const totalNotifications = await Notification.countDocuments();
    const pendingNotifications = await Notification.countDocuments({ sent: false });
    const todayNotifications = await Notification.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.json({
      byType: stats,
      summary: {
        total: totalNotifications,
        pending: pendingNotifications,
        today: todayNotifications
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a manual notification (admin only)
router.post('/', auth, [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('type').isIn(['general', 'maintenance_due', 'insurance_expiry', 'emission_expiry', 'revenue_expiry', 'license_expiry']).withMessage('Invalid notification type'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('recipients').isArray().withMessage('Recipients must be an array'),
  body('recipients.*').isMongoId().withMessage('Invalid recipient ID')
], async (req, res) => {
  try {
    // Check if user is admin
    if (!['admin', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      message,
      type,
      priority = 'medium',
      recipients,
      vehicle,
      user,
      scheduledFor,
      metadata
    } = req.body;

    const notification = new Notification({
      title,
      message,
      type,
      priority,
      vehicle,
      user,
      recipients: recipients.map(userId => ({ user: userId })),
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      metadata: metadata || {}
    });

    await notification.save();

    res.status(201).json({
      message: 'Notification created successfully',
      notification: await notification.populate('vehicle', 'vehicleNumber modelMake')
        .populate('user', 'firstName lastName')
        .populate('recipients.user', 'firstName lastName email')
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a notification (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!['admin', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Trigger manual notification check (admin only)
router.post('/check', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!['admin', 'Admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notificationService = require('../services/notificationService');
    await notificationService.checkAndCreateNotifications();

    res.json({ message: 'Notification check completed successfully' });
  } catch (error) {
    console.error('Error in manual notification check:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
