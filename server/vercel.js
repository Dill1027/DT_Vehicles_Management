// Vercel serverless function handler for DT Vehicles Management API
const serverless = require('serverless-http');
const app = require('./server');

// Export the serverless handler
module.exports = serverless(app);
