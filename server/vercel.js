// Vercel serverless function handler for DT Vehicles Management API
const serverless = require('serverless-http');
const app = require('./serverVercel');

// Configure serverless options for better error handling
const serverlessOptions = {
  provider: {
    type: 'aws',
    timeout: 10, // Timeout in seconds
  },
  basePath: '', // Empty for root path handling
  request: {
    // Log unhandled errors
    onError: (err) => {
      console.error('Unhandled serverless error:', err);
    }
  }
};

// Export the serverless handler with options
module.exports = serverless(app, serverlessOptions);
