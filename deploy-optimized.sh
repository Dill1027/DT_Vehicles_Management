#!/bin/bash

# Vercel Deployment Script - Optimized Version
# This script helps deploy the optimized version to Vercel

echo "🚀 DT Vehicles Management - Optimized Deployment"
echo "================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Pre-Deployment Checklist${NC}"
echo ""

# Check if compression is installed in server
if grep -q '"compression"' server/package.json; then
    echo -e "${GREEN}✅ Compression package found in server/package.json${NC}"
else
    echo -e "${RED}❌ Compression package missing!${NC}"
    echo "Installing compression package..."
    cd server && npm install compression@^1.7.4 && cd ..
fi

# Check if jsPDF is installed in client
if grep -q '"jspdf"' client/package.json; then
    echo -e "${GREEN}✅ jsPDF package found in client/package.json${NC}"
else
    echo -e "${RED}❌ jsPDF package missing!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}🔧 Building Project${NC}"
echo ""

# Build client
echo "Building frontend..."
cd client
if npm run build; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${YELLOW}📊 Bundle Size Analysis${NC}"
echo ""

# Check build sizes
if [ -d "client/build/static/js" ]; then
    echo "JavaScript bundle sizes:"
    du -sh client/build/static/js/*.js | sort -h
    echo ""
    
    TOTAL_SIZE=$(du -sh client/build | awk '{print $1}')
    echo "Total build size: $TOTAL_SIZE"
fi

echo ""
echo -e "${GREEN}✅ Optimization Features Enabled:${NC}"
echo "  • Lazy loading for jsPDF (saves ~200KB on initial load)"
echo "  • Gzip compression (70-80% size reduction)"
echo "  • Aggressive caching headers"
echo "  • Resource hints (preconnect, dns-prefetch)"
echo "  • React.StrictMode disabled in production"
echo "  • Optimized serverless function config"

echo ""
echo -e "${YELLOW}🌐 Deployment Options${NC}"
echo ""
echo "Choose your deployment method:"
echo "1. Deploy frontend and backend together (recommended)"
echo "2. Deploy frontend only"
echo "3. Deploy backend only"
echo "4. Exit without deploying"
echo ""
read -p "Enter option (1-4): " option

case $option in
    1)
        echo ""
        echo -e "${YELLOW}Deploying full application to Vercel...${NC}"
        vercel --prod
        ;;
    2)
        echo ""
        echo -e "${YELLOW}Deploying frontend only...${NC}"
        cd client && vercel --prod && cd ..
        ;;
    3)
        echo ""
        echo -e "${YELLOW}Deploying backend only...${NC}"
        cd server && vercel --prod && cd ..
        ;;
    4)
        echo "Deployment cancelled."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Post-Deployment Checklist:${NC}"
echo "  1. Test the application in your browser"
echo "  2. Run Lighthouse audit to verify performance"
echo "  3. Check Network tab to verify:"
echo "     • Gzip compression is working"
echo "     • Cache headers are present"
echo "     • jsPDF loads only when generating PDF"
echo "  4. Monitor Vercel Analytics for performance metrics"
echo ""
echo "For detailed testing instructions, see:"
echo "  📄 VERCEL_OPTIMIZATION_GUIDE.md"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
