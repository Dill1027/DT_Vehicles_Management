#!/bin/bash

# Quick Vercel Deployment Script
# This script will guide you through deploying your DT Vehicles Management System to Vercel

set -e

echo "🚀 DT Vehicles Management - Vercel Deployment"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if Vercel CLI is installed
check_vercel_cli() {
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI not found. Installing...${NC}"
        npm install -g vercel
        echo -e "${GREEN}✅ Vercel CLI installed successfully!${NC}"
    else
        echo -e "${GREEN}✅ Vercel CLI is already installed${NC}"
    fi
}

# Function to login to Vercel
login_vercel() {
    echo -e "${BLUE}🔐 Logging into Vercel...${NC}"
    vercel login
    echo -e "${GREEN}✅ Logged into Vercel successfully!${NC}"
}

# Function to deploy backend
deploy_backend() {
    echo -e "${BLUE}📦 Deploying Backend API...${NC}"
    echo ""
    
    cd server
    
    echo "Setting up environment variables for backend..."
    echo "You'll need to set these in Vercel dashboard:"
    echo "  - MONGODB_URI (your MongoDB connection string)"
    echo "  - JWT_SECRET (a secure random string)"
    echo "  - NODE_ENV=production"
    echo ""
    
    read -p "Press Enter to continue with backend deployment..."
    
    # Deploy to Vercel
    echo "Deploying backend to Vercel..."
    vercel --prod
    
    echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
    echo ""
    echo -e "${YELLOW}📝 Important: Note your backend URL from the output above${NC}"
    echo -e "${YELLOW}You'll need it for the frontend deployment${NC}"
    echo ""
    
    cd ..
}

# Function to update frontend API URL
update_frontend_config() {
    echo -e "${BLUE}🔧 Updating frontend configuration...${NC}"
    
    read -p "Enter your backend URL (from previous step): " backend_url
    
    if [ -z "$backend_url" ]; then
        echo -e "${RED}❌ Backend URL is required!${NC}"
        exit 1
    fi
    
    # Update the API configuration
    cat > client/src/services/api-config.js << EOF
// Auto-generated API configuration for deployment
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || '${backend_url}',
  TIMEOUT: 10000,
  ENVIRONMENT: process.env.NODE_ENV || 'production'
};
EOF
    
    echo -e "${GREEN}✅ Frontend configuration updated with backend URL: ${backend_url}${NC}"
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${BLUE}📦 Deploying Frontend...${NC}"
    echo ""
    
    cd client
    
    echo "Setting up environment variables for frontend..."
    echo "You'll need to set this in Vercel dashboard:"
    echo "  - REACT_APP_API_URL (your backend URL)"
    echo ""
    
    read -p "Press Enter to continue with frontend deployment..."
    
    # Build the project
    echo "Building React application..."
    npm run build
    
    # Deploy to Vercel
    echo "Deploying frontend to Vercel..."
    vercel --prod
    
    echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
    echo ""
    
    cd ..
}

# Function to show final instructions
show_final_instructions() {
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo "📋 Final steps to complete setup:"
    echo ""
    echo "1. 🌐 Go to your Vercel dashboard (https://vercel.com/dashboard)"
    echo ""
    echo "2. 🔧 Set environment variables for your backend project:"
    echo "   - MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database"
    echo "   - JWT_SECRET=your-secure-random-string"
    echo "   - NODE_ENV=production"
    echo ""
    echo "3. 🔧 Set environment variables for your frontend project:"
    echo "   - REACT_APP_API_URL=https://your-backend-url.vercel.app"
    echo ""
    echo "4. 🔄 Redeploy both projects after setting environment variables"
    echo ""
    echo "5. 🧪 Test your application:"
    echo "   - Visit your frontend URL"
    echo "   - Try adding/viewing vehicles"
    echo "   - Check browser console for errors"
    echo ""
    echo "📖 For detailed instructions, check VERCEL_DEPLOYMENT_GUIDE.md"
    echo ""
    echo -e "${YELLOW}💡 Pro tip: You can redeploy anytime by running 'vercel --prod' in the respective directory${NC}"
}

# Main execution
main() {
    echo "Welcome to the DT Vehicles Management Vercel deployment script!"
    echo ""
    
    # Check prerequisites
    check_vercel_cli
    
    # Login to Vercel
    login_vercel
    
    echo ""
    echo "What would you like to deploy?"
    echo "1) Deploy backend first (recommended for new deployments)"
    echo "2) Deploy frontend (requires backend to be already deployed)"
    echo "3) Deploy both (backend first, then frontend)"
    echo "4) Exit"
    echo ""
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_backend
            echo ""
            echo -e "${YELLOW}Backend deployed! Run this script again and choose option 2 to deploy frontend.${NC}"
            ;;
        2)
            update_frontend_config
            deploy_frontend
            ;;
        3)
            deploy_backend
            echo ""
            update_frontend_config
            deploy_frontend
            ;;
        4)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
            exit 1
            ;;
    esac
    
    # Show final instructions
    show_final_instructions
}

# Run the main function
main
