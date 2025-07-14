#!/bin/bash

# Separate Deployment script for Vercel
echo "🚀 Preparing for SEPARATE Vercel deployment..."

# Check if git is clean
if [[ -n $(git status --porcelain) ]]; then
  echo "⚠️  Warning: You have uncommitted changes. Please commit them first."
  git status --short
  exit 1
fi

echo "� SEPARATE DEPLOYMENT PROCESS"
echo "=============================="
echo ""
echo "This project is configured for SEPARATE frontend and backend deployment."
echo ""
echo "🎯 STEP 1: Deploy Backend First"
echo "  cd server"
echo "  ./deploy-backend.sh"
echo "  vercel"
echo ""
echo "🎯 STEP 2: Deploy Frontend Second"
echo "  cd client"
echo "  ./deploy-frontend.sh"
echo "  vercel"
echo ""
echo "🎯 STEP 3: Update URLs"
echo "  - Update backend FRONTEND_URL with actual frontend URL"
echo "  - Update frontend REACT_APP_API_URL with actual backend URL"
echo ""
echo "📚 See SEPARATE_DEPLOYMENT.md for detailed instructions"
echo ""
echo "✅ Benefits of separate deployment:"
echo "   • Independent scaling"
echo "   • Better team workflow"
echo "   • Performance optimization"
echo "   • Easier debugging"
