const { createProxyMiddleware } = require('http-proxy-middleware');

// This proxy configuration is used during local development
module.exports = function(app) {
  // Only apply proxy in development
  if (process.env.NODE_ENV === 'development') {
    app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://127.0.0.1:5002/api',
        changeOrigin: true,
        proxyTimeout: 30000,
        timeout: 30000
      })
    );
  }
};
