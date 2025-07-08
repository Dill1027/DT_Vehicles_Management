#!/bin/bash

# Vercel Deployment Script for DT Vehicles Management System
# This script will deploy both frontend and backend to Vercel

set -e

echo "🚀 Starting Vercel deployment for DT Vehicles Management System"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI is not installed. Installing...${NC}"
    npm install -g vercel
fi

# Function to deploy backend
deploy_backend() {
    echo -e "${BLUE}📦 Deploying backend API...${NC}"
    cd server
    
    # Check if vercel.json exists
    if [ ! -f "vercel.json" ]; then
        echo -e "${RED}❌ vercel.json not found in server directory${NC}"
        exit 1
    fi
    
    # Deploy to Vercel
    echo "Deploying backend to Vercel..."
    vercel --prod --confirm
    
    echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
    cd ..
}

# Function to deploy frontend
deploy_frontend() {
    echo -e "${BLUE}📦 Deploying frontend...${NC}"
    cd client
    
    # Check if vercel.json exists
    if [ ! -f "vercel.json" ]; then
        echo -e "${RED}❌ vercel.json not found in client directory${NC}"
        exit 1
    fi
    
    # Build the project first
    echo "Building React app..."
    npm run build
    
    # Deploy to Vercel
    echo "Deploying frontend to Vercel..."
    vercel --prod --confirm
    
    echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
    cd ..
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo -e "${RED}❌ package.json not found. Please run this script from the project root.${NC}"
        exit 1
    fi
    
    # Check if client directory exists
    if [ ! -d "client" ]; then
        echo -e "${RED}❌ client directory not found${NC}"
        exit 1
    fi
    
    # Check if server directory exists
    if [ ! -d "server" ]; then
        echo -e "${RED}❌ server directory not found${NC}"
        exit 1
    fi
    
    # Check if dependencies are installed
    echo "Checking dependencies..."
    
    if [ ! -d "server/node_modules" ]; then
        echo "Installing server dependencies..."
        cd server && npm install && cd ..
    fi
    
    if [ ! -d "client/node_modules" ]; then
        echo "Installing client dependencies..."
        cd client && npm install && cd ..
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed!${NC}"
}

# Function to show post-deployment instructions
show_instructions() {
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo "📋 Next steps:"
    echo "1. Get your backend URL from Vercel dashboard"
    echo "2. Update REACT_APP_API_URL in your frontend environment variables"
    echo "3. Redeploy frontend with the correct API URL"
    echo "4. Test your application"
    echo ""
    echo "🔧 Environment variables to set in Vercel:"
    echo ""
    echo "Backend:"
    echo "  - NODE_ENV=production"
    echo "  - MONGODB_URI=your_mongodb_connection_string"
    echo "  - JWT_SECRET=your_jwt_secret"
    echo "  - PORT=3001"
    echo ""
    echo "Frontend:"
    echo "  - REACT_APP_API_URL=https://your-backend.vercel.app"
    echo ""
    echo "📖 Check VERCEL_DEPLOYMENT_GUIDE.md for detailed instructions"
}

# Main execution
main() {
    echo "DT Vehicles Management - Vercel Deployment"
    echo "========================================"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Ask user what to deploy
    echo "What would you like to deploy?"
    echo "1) Backend only"
    echo "2) Frontend only"
    echo "3) Both backend and frontend"
    echo "4) Exit"
    echo ""
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            deploy_backend
            ;;
        2)
            deploy_frontend
            ;;
        3)
            deploy_backend
            echo ""
            deploy_frontend
            ;;
        4)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Please run the script again.${NC}"
            exit 1
            ;;
    esac
    
    # Show post-deployment instructions
    show_instructions
}

# Run the main function
main
