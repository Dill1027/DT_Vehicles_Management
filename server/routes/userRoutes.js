const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadProfileImage,
  updatePreferences,
  getProfileImage
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['Admin', 'Manager', 'Driver', 'Mechanic', 'Viewer'])
    .withMessage('Valid role is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('phoneNumber')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Valid phone number is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const updateProfileValidation = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phoneNumber')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Valid phone number is required'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const updateUserValidation = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role')
    .optional()
    .isIn(['Admin', 'Manager', 'Driver', 'Mechanic', 'Viewer'])
    .withMessage('Valid role is required'),
  body('department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('employeeId').optional().trim().notEmpty().withMessage('Employee ID cannot be empty'),
  body('phoneNumber')
    .optional()
    .matches(/^\+?[\d\s-()]+$/)
    .withMessage('Valid phone number is required'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, changePassword);
router.put('/preferences', authenticate, updatePreferences);
router.post('/profile/image', authenticate, upload.single('profileImage'), handleMulterError, uploadProfileImage);
router.get('/profile-image/:imagePath', getProfileImage); // Route to serve profile images

// Admin/Manager routes
router.get('/', authenticate, authorize(['Admin', 'Manager']), getAllUsers);
router.get('/:id', authenticate, authorize(['Admin', 'Manager']), getUserById);
router.put('/:id', authenticate, authorize(['Admin']), updateUserValidation, updateUser);
router.delete('/:id', authenticate, authorize(['Admin']), deleteUser);

module.exports = router;
