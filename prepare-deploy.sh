#!/bin/bash

# DT Vehicles Management - Vercel Deployment Script
echo "🚀 Preparing for Vercel deployment..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in project root directory. Please run from the project root."
    exit 1
fi

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build the client
echo "🔨 Building client..."
cd client
npm run build
cd ..

echo "✅ Project prepared for deployment!"
echo ""
echo "Now run: vercel --prod"
echo "Or for first deployment: vercel"
