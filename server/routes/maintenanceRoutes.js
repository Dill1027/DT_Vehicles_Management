const express = require('express');
const { body } = require('express-validator');
const {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceByVehicle,
  getOverdueMaintenance,
  getMaintenanceStats,
  approveMaintenance
} = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const maintenanceValidation = [
  body('vehicle').isMongoId().withMessage('Valid vehicle ID is required'),
  body('type')
    .isIn(['Scheduled', 'Preventive', 'Repair', 'Emergency', 'Inspection', 'Recall'])
    .withMessage('Valid maintenance type is required'),
  body('category')
    .isIn([
      'Engine', 'Transmission', 'Brakes', 'Tires', 'Oil Change', 'Battery',
      'Air Filter', 'Cooling System', 'Electrical', 'Suspension', 'Exhaust',
      'Body Work', 'Interior', 'Safety Systems', 'Other'
    ])
    .withMessage('Valid maintenance category is required'),
  body('description').trim().notEmpty().withMessage('Maintenance description is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('priority')
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Valid priority is required'),
  body('assignedMechanic')
    .optional()
    .isMongoId()
    .withMessage('Valid mechanic ID is required'),
  body('cost.labor')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Labor cost must be a positive number'),
  body('cost.parts')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Parts cost must be a positive number'),
  body('cost.other')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Other cost must be a positive number'),
  body('mileageAtService')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Mileage at service must be a positive number')
];

const updateMaintenanceValidation = [
  body('type')
    .optional()
    .isIn(['Scheduled', 'Preventive', 'Repair', 'Emergency', 'Inspection', 'Recall'])
    .withMessage('Valid maintenance type is required'),
  body('category')
    .optional()
    .isIn([
      'Engine', 'Transmission', 'Brakes', 'Tires', 'Oil Change', 'Battery',
      'Air Filter', 'Cooling System', 'Electrical', 'Suspension', 'Exhaust',
      'Body Work', 'Interior', 'Safety Systems', 'Other'
    ])
    .withMessage('Valid maintenance category is required'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Maintenance description cannot be empty'),
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('status')
    .optional()
    .isIn(['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'Overdue'])
    .withMessage('Valid status is required'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Valid priority is required'),
  body('assignedMechanic')
    .optional()
    .isMongoId()
    .withMessage('Valid mechanic ID is required'),
  body('cost.labor')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Labor cost must be a positive number'),
  body('cost.parts')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Parts cost must be a positive number'),
  body('cost.other')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Other cost must be a positive number'),
  body('mileageAtService')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Mileage at service must be a positive number')
];

const approveMaintenanceValidation = [
  body('approvalNotes')
    .optional()
    .trim()
    .withMessage('Approval notes must be a string')
];

// Routes
router.get('/', authenticate, getAllMaintenance);
router.get('/stats', authenticate, authorize(['Admin', 'Manager']), getMaintenanceStats);
router.get('/overdue', authenticate, authorize(['Admin', 'Manager', 'Mechanic']), getOverdueMaintenance);
router.get('/vehicle/:vehicleId', authenticate, getMaintenanceByVehicle);
router.get('/:id', authenticate, getMaintenanceById);

router.post('/', 
  authenticate, 
  authorize(['Admin', 'Manager', 'Mechanic']), 
  maintenanceValidation, 
  createMaintenance
);

router.put('/:id', 
  authenticate, 
  authorize(['Admin', 'Manager', 'Mechanic']), 
  updateMaintenanceValidation, 
  updateMaintenance
);

router.delete('/:id', 
  authenticate, 
  authorize(['Admin', 'Manager']), 
  deleteMaintenance
);

router.post('/:id/approve', 
  authenticate, 
  authorize(['Admin', 'Manager']), 
  approveMaintenanceValidation, 
  approveMaintenance
);

module.exports = router;
