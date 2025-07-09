#!/bin/bash

# DT Vehicles Management - Vercel Deployment Script
echo "🚀 Starting deployment to Vercel..."

# Ensure we have the necessary tools
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the client
echo "📦 Building client..."
cd client
npm run build
cd ..

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment process completed!"
