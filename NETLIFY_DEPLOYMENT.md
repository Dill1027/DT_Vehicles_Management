# DT Vehicles Management - Deployment Guide

## Netlify Deployment

The application is configured to deploy to Netlify with the following structure:
- Frontend: React application in the `client` directory
- Backend: Express API served as a Netlify serverless function 

### Architecture Overview

1. **Frontend** 
   - Built with React
   - Deployed from the `client/build` directory
   - Configured via `netlify.toml` in the root directory

2. **Backend API**
   - Express application converted to a serverless function
   - Located at `server/netlify/functions/simple-api.js`
   - Accessible at `https://{your-netlify-domain}/api/*`

### Deployment Process

The deployment process is automated via GitHub integration:

1. Push changes to the GitHub repository
2. Netlify automatically builds and deploys both frontend and backend
3. The frontend will be available at the main Netlify domain
4. The backend API will be available at `{netlify-domain}/api/` endpoints

### Configuration Files

- `netlify.toml`: Main configuration file for Netlify deployment
- `client/.env.production`: Environment variables for the production frontend build
- `server/netlify/functions/simple-api.js`: Serverless function for the backend API

### API Endpoints

The backend API provides the following endpoints:

- `/api/health`: Health check endpoint
- `/api/vehicles`: Get all vehicles
- `/api/vehicles/stats`: Get vehicle statistics

### Troubleshooting

If you encounter CORS issues:
1. Check the CORS configuration in `server/netlify/functions/simple-api.js`
2. Ensure the frontend is making requests to the correct API URL
3. Verify that the API endpoints are accessible using a tool like cURL

## Local Development

To run the application locally:

1. Start the frontend:
   ```
   cd client
   npm install
   npm start
   ```

2. Start the backend:
   ```
   cd server
   npm install
   npm run dev
   ```

The frontend will be available at `http://localhost:3000` and will connect to the backend at `http://localhost:5002`.
