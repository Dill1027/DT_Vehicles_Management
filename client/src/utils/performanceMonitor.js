// Performance monitoring utility for the application
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.enabled = process.env.NODE_ENV === 'development';
  }

  // Start timing a specific operation
  startTiming(name) {
    if (!this.enabled) return;
    
    this.metrics.set(name, {
      startTime: performance.now(),
      name
    });
  }

  // End timing and log if it's slow
  endTiming(name, threshold = 1000) {
    if (!this.enabled || !this.metrics.has(name)) return;
    
    const metric = this.metrics.get(name);
    const endTime = performance.now();
    const duration = endTime - metric.startTime;
    
    if (duration > threshold) {
      console.warn(`🐌 Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    } else if (duration > threshold / 2) {
      console.log(`⚠️ Moderate operation: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    this.metrics.delete(name);
    return duration;
  }

  // Monitor React component render times
  measureComponentRender(componentName, renderFn) {
    if (!this.enabled) return renderFn();
    
    this.startTiming(`render-${componentName}`);
    const result = renderFn();
    this.endTiming(`render-${componentName}`, 50); // Components should render in <50ms
    
    return result;
  }

  // Monitor API call performance
  measureApiCall(endpoint, apiCall) {
    if (!this.enabled) return apiCall();
    
    const callName = `api-${endpoint}`;
    this.startTiming(callName);
    
    if (apiCall && typeof apiCall.then === 'function') {
      return apiCall.then(result => {
        this.endTiming(callName, 2000); // API calls should complete in <2s
        return result;
      }).catch(error => {
        this.endTiming(callName, 2000);
        throw error;
      });
    }
    
    const result = apiCall();
    this.endTiming(callName, 2000);
    return result;
  }

  // Monitor bundle size and loading performance
  measureBundleLoad() {
    if (!this.enabled || typeof window === 'undefined') return;
    
    // Check if Performance Observer is supported
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const loadTime = entry.loadEventEnd - entry.loadEventStart;
            console.log(`📦 Page load time: ${loadTime.toFixed(2)}ms`);
            
            if (loadTime > 3000) {
              console.warn('🚨 Slow page load detected. Consider optimizing bundle size.');
            }
          }
          
          if (entry.entryType === 'resource' && entry.name.includes('.js')) {
            const size = entry.transferSize || 0;
            const duration = entry.responseEnd - entry.requestStart;
            
            if (size > 500000) { // 500KB
              console.warn(`📦 Large JS bundle: ${entry.name} (${(size / 1024).toFixed(2)}KB)`);
            }
            
            if (duration > 1000) {
              console.warn(`⏱️ Slow JS load: ${entry.name} took ${duration.toFixed(2)}ms`);
            }
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation', 'resource'] });
      this.observers.set('bundle', observer);
    }
  }

  // Clean up observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }

  // Get Web Vitals if available
  getWebVitals() {
    if (!this.enabled || typeof window === 'undefined') return;
    
    try {
      // Check for Core Web Vitals
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log(`🎯 LCP: ${entry.startTime.toFixed(2)}ms`);
            if (entry.startTime > 2500) {
              console.warn('🚨 Poor LCP score. Consider optimizing images and fonts.');
            }
          }
        }).observe({entryTypes: ['largest-contentful-paint']});

        // First Input Delay
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            console.log(`⚡ FID: ${entry.processingStart - entry.startTime}ms`);
          }
        }).observe({entryTypes: ['first-input']});
      }
    } catch (error) {
      console.debug('Web Vitals monitoring not available:', error.message);
    }
  }

  // Initialize all monitoring
  init() {
    if (!this.enabled) return;
    
    console.log('🔍 Performance monitoring enabled');
    this.measureBundleLoad();
    this.getWebVitals();
    
    // Clean up on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.cleanup());
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.init();
}

export default performanceMonitor;
