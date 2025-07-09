# DT Vehicles Management Server (Simple Version)

This is a simplified version of the DT Vehicles Management server, designed for quick deployment with minimal dependencies.

## Getting Started

1. Install dependencies
   ```
   npm install
   ```

2. Start the server
   ```
   npm start
   ```

## Deployment Options

This server can be deployed to various platforms:

- Render.com
- Heroku
- Railway
- Digital Ocean App Platform

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/stats` - Get vehicle statistics

## CORS

The server is configured to allow all origins for easy testing and development.
