// Date utility functions
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isDateOverdue = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

// Vehicle utility functions
export const getStatusColor = (status) => {
  switch (status) {
    case 'available':
      return 'text-green-600 bg-green-100';
    case 'in-use':
      return 'text-yellow-600 bg-yellow-100';
    case 'maintenance':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getStatusIcon = (status) => {
  switch (status) {
    case 'available':
      return '✅';
    case 'in-use':
      return '🚗';
    case 'maintenance':
      return '🔧';
    default:
      return '❓';
  }
};

export const getFuelTypeIcon = (fuelType) => {
  switch (fuelType) {
    case 'gasoline':
      return '⛽';
    case 'diesel':
      return '🛢️';
    case 'electric':
      return '🔋';
    case 'hybrid':
      return '⚡';
    default:
      return '⛽';
  }
};

// Number formatting utilities
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '';
  return new Intl.NumberFormat('en-US').format(number);
};

export const formatMileage = (mileage) => {
  if (!mileage) return 'N/A';
  return `${formatNumber(mileage)} miles`;
};

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone);
};

export const validateVIN = (vin) => {
  // Basic VIN validation (17 characters, alphanumeric excluding I, O, Q)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  return vinRegex.test(vin);
};

export const validateLicensePlate = (licensePlate) => {
  // Basic license plate validation (3-8 characters, alphanumeric)
  const plateRegex = /^[A-Z0-9]{3,8}$/i;
  return plateRegex.test(licensePlate);
};

// Search and filter utilities
export const filterVehicles = (vehicles, filters) => {
  return vehicles.filter(vehicle => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchFields = [
        vehicle.make,
        vehicle.model,
        vehicle.vehicleId,
        vehicle.licensePlate,
        vehicle.color
      ].filter(Boolean);
      
      const matchesSearch = searchFields.some(field => 
        field.toLowerCase().includes(searchTerm)
      );
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (vehicle.status !== filters.status) return false;
    }

    // Make filter
    if (filters.make && filters.make !== 'all') {
      if (vehicle.make !== filters.make) return false;
    }

    // Year range filter
    if (filters.yearFrom && vehicle.year < filters.yearFrom) return false;
    if (filters.yearTo && vehicle.year > filters.yearTo) return false;

    // Fuel type filter
    if (filters.fuelType && filters.fuelType !== 'all') {
      if (vehicle.fuelType !== filters.fuelType) return false;
    }

    return true;
  });
};

export const sortVehicles = (vehicles, sortBy, sortOrder = 'asc') => {
  return [...vehicles].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle different data types
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (typeof aValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

// Local storage utilities
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Error handling utilities
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const isNetworkError = (error) => {
  return !error.response && error.code === 'NETWORK_ERROR';
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
