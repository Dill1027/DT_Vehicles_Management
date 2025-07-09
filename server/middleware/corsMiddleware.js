/**
 * Enhanced CORS middleware for DT Vehicles Management API
 * This middleware adds additional CORS headers to every response
 */

const corsMiddleware = (req, res, next) => {
  // Allow all origins for debugging purposes
  res.header('Access-Control-Allow-Origin', '*');
  
  // Standard CORS headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
};

module.exports = corsMiddleware;
