import React, { memo } from 'react';
import PropTypes from 'prop-types';

const OptimizedLoadingSpinner = memo(({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
        {/* Pulse effect for better visual feedback */}
        <div className={`${sizeClasses[size]} absolute inset-0 border-4 border-blue-600 rounded-full opacity-20 animate-ping`}></div>
      </div>
      {message && (
        <p className="text-sm text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
});

OptimizedLoadingSpinner.displayName = 'OptimizedLoadingSpinner';

OptimizedLoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xl']),
  message: PropTypes.string,
};

export default OptimizedLoadingSpinner;
