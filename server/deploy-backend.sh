#!/bin/bash

# Backend Deployment Script for Vercel
echo "🚀 Preparing Backend for Vercel deployment..."

# Check if we're in the server directory
if [ ! -f "server.js" ]; then
  echo "❌ Please run this script from the server directory"
  exit 1
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Check if server.js exists
if [ ! -f "server.js" ]; then
  echo "❌ server.js not found!"
  exit 1
fi

echo "✅ Backend ready for deployment!"
echo ""
echo "🎯 Deploy to Vercel:"
echo "1. From the /server directory, run: vercel"
echo "2. Or deploy via Vercel dashboard"
echo ""
echo "📋 Environment variables to set in Vercel:"
echo "   NODE_ENV=production"
echo "   MONGODB_URI=your_mongodb_atlas_connection_string"
echo "   JWT_SECRET=your_super_secure_jwt_secret"
echo "   FRONTEND_URL=https://dt-vehicles-frontend.vercel.app"
echo ""
echo "🔗 After deployment, update the frontend's REACT_APP_API_URL"
