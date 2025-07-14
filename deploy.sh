#!/bin/bash

# Deployment script for Vercel
echo "🚀 Preparing for Vercel deployment..."

# Check if git is clean
if [[ -n $(git status --porcelain) ]]; then
  echo "⚠️  Warning: You have uncommitted changes. Please commit them first."
  git status --short
  exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build the client
echo "🏗️  Building client..."
cd client
npm run build
cd ..

# Test if build was successful
if [ ! -d "client/build" ]; then
  echo "❌ Build failed! client/build directory not found."
  exit 1
fi

echo "✅ Build successful!"
echo "📁 Build output size:"
du -sh client/build

echo ""
echo "🎯 Ready for Vercel deployment!"
echo ""
echo "Next steps:"
echo "1. Push your changes to GitHub"
echo "2. Deploy using Vercel dashboard or CLI:"
echo "   - Dashboard: https://vercel.com/dashboard"
echo "   - CLI: vercel"
echo ""
echo "3. Set up these environment variables in Vercel:"
echo "   Backend:"
echo "   - NODE_ENV=production"
echo "   - MONGODB_URI=your_mongodb_connection_string"
echo "   - JWT_SECRET=your_jwt_secret"
echo "   - FRONTEND_URL=https://your-app.vercel.app"
echo ""
echo "   Frontend:"
echo "   - REACT_APP_API_URL=https://your-app.vercel.app/api"
echo "   - REACT_APP_USE_STATIC_DATA=false"
echo "   - REACT_APP_NODE_ENV=production"
