#!/bin/bash

# 🚀 Complete Netlify Deployment Script for DT Vehicles Management
# This script deploys both frontend and backend to Netlify

echo "🚀 Starting Complete Netlify Deployment..."

# Set colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    print_error "Netlify CLI is not installed. Installing..."
    npm install -g netlify-cli
    print_success "Netlify CLI installed"
fi

# Deploy Backend (if not already deployed)
echo ""
echo "🔧 Deploying Backend..."
cd server
if [ -f ".netlify/state.json" ]; then
    print_warning "Backend already linked to Netlify. Redeploying..."
    netlify deploy --prod
else
    print_warning "Backend not linked. Please deploy manually or link to existing project."
fi

# Deploy Frontend
echo ""
echo "🎨 Deploying Frontend..."
cd ../
if [ -f ".netlify/state.json" ]; then
    print_warning "Frontend already linked to Netlify. Redeploying..."
    netlify deploy --prod
else
    print_warning "Frontend not linked. Deploying as new project..."
    netlify deploy --prod
fi

# Final status check
echo ""
echo "🧪 Testing Deployments..."

# Test backend health
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://dtvehicle.netlify.app/api/health)
if [ "$BACKEND_STATUS" = "200" ]; then
    print_success "Backend is responding (https://dtvehicle.netlify.app)"
else
    print_error "Backend health check failed"
fi

# Test frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://strong-seahorse-77cbee.netlify.app)
if [ "$FRONTEND_STATUS" = "200" ]; then
    print_success "Frontend is responding (https://strong-seahorse-77cbee.netlify.app)"
else
    print_error "Frontend health check failed"
fi

echo ""
echo "📋 Deployment Summary:"
echo "Frontend: https://strong-seahorse-77cbee.netlify.app"
echo "Backend:  https://dtvehicle.netlify.app"
echo ""
print_warning "⚠️  IMPORTANT: Set environment variables in backend:"
echo "   Go to: https://app.netlify.com/projects/dtvehicle/settings/env-vars"
echo "   Add: NODE_ENV, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN"
echo ""
print_success "🎉 Deployment complete! Check NETLIFY_FULL_DEPLOYMENT_SUCCESS.md for details."
