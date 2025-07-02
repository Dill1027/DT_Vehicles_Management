#!/bin/bash

# Script to prepare and deploy backend to Render or Railway

echo "🚀 Preparing backend for deployment..."

# Create a temporary directory for backend deployment
rm -rf backend-deploy
mkdir backend-deploy

# Copy server files
cp -r server/* backend-deploy/
cp server/.env backend-deploy/ 2>/dev/null || echo "No .env file found (will use environment variables)"

# Create deployment-specific files
cd backend-deploy

# Create a simple start script
echo "Creating deployment files..."

# Create a Procfile for Heroku/Railway
echo "web: node server.js" > Procfile

# Create a render.yaml for Render deployment
cat > render.yaml << 'EOF'
services:
  - type: web
    name: dt-vehicles-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: dt-vehicles-db
          property: connectionString
EOF

echo "✅ Backend deployment files created in backend-deploy directory"
echo ""
echo "📋 Next steps:"
echo "1. Create a new GitHub repository for the backend"
echo "2. Push the backend-deploy contents to that repository"
echo "3. Connect it to Render, Railway, or Heroku"
echo ""
echo "🔗 Deployment services:"
echo "- Render: https://render.com (Recommended - Free tier)"
echo "- Railway: https://railway.app (Good alternative)"
echo "- Heroku: https://heroku.com (Has free tier limitations)"
