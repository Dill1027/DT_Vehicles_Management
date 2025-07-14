#!/bin/bash

# Frontend Deployment Script for Vercel
echo "🚀 Preparing Frontend for Vercel deployment..."

# Check if we're in the client directory
if [ ! -f "package.json" ]; then
  echo "❌ Please run this script from the client directory"
  exit 1
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build the project
echo "🏗️  Building React app..."
npm run build

# Check if build was successful
if [ ! -d "build" ]; then
  echo "❌ Build failed! build directory not found."
  exit 1
fi

echo "✅ Frontend built successfully!"
echo "📁 Build output size:"
du -sh build

echo ""
echo "🎯 Deploy to Vercel:"
echo "1. From the /client directory, run: vercel"
echo "2. Or deploy via Vercel dashboard"
echo ""
echo "📋 Environment variables to set in Vercel:"
echo "   REACT_APP_API_URL=https://dt-vehicles-backend.vercel.app"
echo "   REACT_APP_USE_STATIC_DATA=false"
echo "   REACT_APP_NODE_ENV=production"
echo ""
echo "🔗 After deployment, update the backend's FRONTEND_URL"
