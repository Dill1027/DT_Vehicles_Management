# Simple Server Deployment Guide

This guide explains how to deploy the simple backend server for DT Vehicles Management to various cloud platforms.

## Local Development

1. Navigate to the server directory:
   ```bash
   cd server-simple
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. The server will be available at http://localhost:5002

## Deployment Options

### Render.com Deployment (Recommended)

1. Create a new Web Service on Render.com
2. Connect to your GitHub repository
3. Use the following settings:
   - Name: dt-vehicles-api
   - Root Directory: server-simple
   - Environment: Node
   - Build Command: npm install
   - Start Command: npm start
   - Add environment variable: NODE_ENV=production

### Heroku Deployment

1. Make sure you have the Heroku CLI installed
2. Navigate to the server-simple directory
3. Create a Heroku app:
   ```bash
   heroku create dt-vehicles-api
   ```
4. Deploy the app:
   ```bash
   git subtree push --prefix server-simple heroku main
   ```

### Railway.app Deployment

1. Create a new project on Railway.app
2. Connect to your GitHub repository
3. Set the Root Directory to server-simple
4. The deployment will happen automatically

## Frontend Configuration

After deploying the backend, update the frontend to point to your new API:

1. Edit `/client/.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend-url/api
   ```

2. Deploy the frontend to Netlify, Vercel, or your preferred hosting service

## API Endpoints

The following endpoints are available:

- `GET /health` - Health check endpoint
- `GET /api/health` - API health check endpoint
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/stats` - Get vehicle statistics
