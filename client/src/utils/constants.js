// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://server-lw0u8udpp-dill1027s-projects.vercel.app/api';

// Vehicle Status Options
export const VEHICLE_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  IN_SERVICE: 'In Service',
  OUT_OF_SERVICE: 'Out of Service',
  UNDER_MAINTENANCE: 'Under Maintenance',
  RETIRED: 'Retired'
};

export const VEHICLE_STATUS_OPTIONS = [
  { value: VEHICLE_STATUS.ACTIVE, label: 'Active', color: 'green' },
  { value: VEHICLE_STATUS.INACTIVE, label: 'Inactive', color: 'red' },
  { value: VEHICLE_STATUS.IN_SERVICE, label: 'In Service', color: 'blue' },
  { value: VEHICLE_STATUS.OUT_OF_SERVICE, label: 'Out of Service', color: 'orange' },
  { value: VEHICLE_STATUS.UNDER_MAINTENANCE, label: 'Under Maintenance', color: 'yellow' },
  { value: VEHICLE_STATUS.RETIRED, label: 'Retired', color: 'gray' }
];

// Vehicle Condition Options
export const VEHICLE_CONDITION = {
  EXCELLENT: 'Excellent',
  GOOD: 'Good',
  FAIR: 'Fair',
  POOR: 'Poor',
  CRITICAL: 'Critical'
};

export const VEHICLE_CONDITION_OPTIONS = [
  { value: VEHICLE_CONDITION.EXCELLENT, label: 'Excellent', color: 'green' },
  { value: VEHICLE_CONDITION.GOOD, label: 'Good', color: 'blue' },
  { value: VEHICLE_CONDITION.FAIR, label: 'Fair', color: 'yellow' },
  { value: VEHICLE_CONDITION.POOR, label: 'Poor', color: 'orange' },
  { value: VEHICLE_CONDITION.CRITICAL, label: 'Critical', color: 'red' }
];

// Vehicle Type Options
export const VEHICLE_TYPES = [
  'Car', 'Van', 'Truck', 'Bus', 'Motorcycle', 'Lorry', 'Heavy Machinery',
  'Scooter', 'Electric bike (E-bike)', 'Tuk-tuk (Three-wheeler)', 'Jeep',
  'Electric car (EV)', 'Hybrid car', 'Electric van', 'Electric bike/scooter', 'Other'
];

// Fuel Type Options
export const FUEL_TYPES = {
  PETROL: 'Petrol',
  DIESEL: 'Diesel',
  ELECTRIC: 'Electric',
  HYBRID: 'Hybrid',
  CNG: 'CNG',
  LPG: 'LPG'
};

export const FUEL_TYPE_OPTIONS = [
  { value: FUEL_TYPES.PETROL, label: 'Petrol' },
  { value: FUEL_TYPES.DIESEL, label: 'Diesel' },
  { value: FUEL_TYPES.ELECTRIC, label: 'Electric' },
  { value: FUEL_TYPES.HYBRID, label: 'Hybrid' },
  { value: FUEL_TYPES.CNG, label: 'CNG' },
  { value: FUEL_TYPES.LPG, label: 'LPG' }
];

// Vehicle Make/Brand Options
export const VEHICLE_MAKES = {
  CAR_BRANDS: [
    'Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen',
    'Hyundai', 'Kia', 'Nissan', 'Mazda', 'Subaru', 'Lexus', 'Acura',
    'Infiniti', 'Cadillac', 'Chevrolet', 'Buick', 'GMC', 'Jeep',
    'Chrysler', 'Dodge', 'Ram', 'Lincoln', 'Volvo', 'Jaguar', 'Land Rover',
    'Porsche', 'Ferrari', 'Lamborghini', 'Maserati', 'Bentley', 'Rolls-Royce',
    'McLaren', 'Aston Martin', 'Bugatti', 'Koenigsegg', 'Pagani',
    'Tesla', 'Rivian', 'Lucid Motors', 'Polestar'
  ],
  MOTORCYCLE_BRANDS: [
    'Bajaj', 'Hero', 'TVS', 'Royal Enfield', 'Yamaha', 'Kawasaki',
    'Suzuki', 'KTM', 'Ducati', 'Harley-Davidson', 'Triumph', 'Indian',
    'Aprilia', 'Benelli', 'CFMoto', 'platina'
  ],
  COMMERCIAL_BRANDS: [
    'Tata', 'Ashok Leyland', 'Mahindra', 'Eicher', 'Force Motors',
    'Isuzu', 'Mercedes-Benz Commercial', 'Volvo Trucks', 'MAN', 'Scania'
  ]
};

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  ISO: 'yyyy-MM-dd\'T\'HH:mm:ss.SSSxxx'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'userPreferences',
  RECENT_SEARCHES: 'recentSearches'
};

// Route Paths
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  VEHICLES: '/vehicles',
  ADD_VEHICLE: '/vehicles/add',
  EDIT_VEHICLE: '/vehicles/edit/:id',
  VEHICLE_DETAIL: '/vehicles/:id',
  MAINTENANCE: '/maintenance',
  REPORTS: '/reports',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register'
};

// Validation Rules
export const VALIDATION = {
  VEHICLE_ID: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 20,
    PATTERN: /^[A-Z0-9-]+$/i
  },
  VIN: {
    LENGTH: 17,
    PATTERN: /^[A-HJ-NPR-Z0-9]{17}$/
  },
  LICENSE_PLATE: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 10,
    PATTERN: /^[A-Z0-9\s-]+$/i
  },
  YEAR: {
    MIN: 1900,
    MAX: new Date().getFullYear() + 2
  },
  MILEAGE: {
    MIN: 0,
    MAX: 999999999
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: 'File size is too large. Maximum size is 5MB.',
  INVALID_FILE_TYPE: 'Invalid file type. Only images are allowed.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  VEHICLE_CREATED: 'Vehicle created successfully!',
  VEHICLE_UPDATED: 'Vehicle updated successfully!',
  VEHICLE_DELETED: 'Vehicle deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!'
};

// Theme Colors
export const COLORS = {
  PRIMARY: '#2563eb',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6'
};

// Chart Colors
export const CHART_COLORS = [
  '#2563eb', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
];

const constants = {
  API_BASE_URL,
  VEHICLE_STATUS,
  VEHICLE_STATUS_OPTIONS,
  VEHICLE_CONDITION,
  VEHICLE_CONDITION_OPTIONS,
  VEHICLE_TYPES,
  VEHICLE_MAKES,
  FUEL_TYPES,
  FUEL_TYPE_OPTIONS,
  FILE_LIMITS,
  PAGINATION,
  DATE_FORMATS,
  STORAGE_KEYS,
  ROUTES,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  COLORS,
  CHART_COLORS
};

export default constants;
