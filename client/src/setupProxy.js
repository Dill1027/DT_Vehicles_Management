const { createProxyMiddleware } = require('http-proxy-middleware');

// This proxy configuration is used during local development
module.exports = function(app) {
  // Only apply proxy in development
  if (process.env.NODE_ENV === 'development') {
    app.use(
      '/api',
      createProxyMiddleware({
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
        pathRewrite: {
          '^/api': '' // Remove /api prefix when proxying to local server
        },
        logLevel: process.env.DEBUG_PROXY ? 'debug' : 'info'
      })
    );
  }
};
