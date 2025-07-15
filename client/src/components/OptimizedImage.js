import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

const OptimizedImage = React.memo(({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/api/placeholder/150/150',
  lazy = true,
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(hasError ? fallbackSrc : src);

  // Memoize the image loading props
  const imageProps = useMemo(() => ({
    ...props,
    src: currentSrc,
    alt,
    className: `${className} ${isLoading ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`,
    loading: lazy ? 'lazy' : 'eager',
    onLoad: () => {
      setIsLoading(false);
      setHasError(false);
    },
    onError: () => {
      setIsLoading(false);
      setHasError(true);
      if (currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      }
    }
  }), [currentSrc, alt, className, isLoading, lazy, fallbackSrc, props]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      <img {...imageProps} />
    </div>
  );
});

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  fallbackSrc: PropTypes.string,
  lazy: PropTypes.bool,
};

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
