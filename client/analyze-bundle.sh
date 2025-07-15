#!/bin/bash

# Bundle Analysis Script for DT Vehicles Management
# This script helps identify what's making the application load slowly

echo "🔍 Analyzing bundle size and performance..."
echo "=================================="

# Check if we're in the client directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the client directory"
    exit 1
fi

# Install webpack-bundle-analyzer if not present
if ! npm list webpack-bundle-analyzer >/dev/null 2>&1; then
    echo "📦 Installing webpack-bundle-analyzer..."
    npm install --save-dev webpack-bundle-analyzer
fi

# Build the application for analysis
echo "🏗️ Building application for analysis..."
npm run build

# Check build size
echo ""
echo "📊 Build Statistics:"
echo "==================="

if [ -d "build/static/js" ]; then
    echo "JavaScript files:"
    ls -lh build/static/js/*.js | awk '{print $5 "\t" $9}'
    
    # Calculate total JS size
    total_js_size=$(du -ch build/static/js/*.js | tail -1 | cut -f1)
    echo "Total JS size: $total_js_size"
    
    # Check for large files
    echo ""
    echo "🚨 Large files (>100KB):"
    find build/static -name "*.js" -o -name "*.css" | xargs ls -lh | awk '$5 ~ /[0-9]+[0-9][0-9]K|[0-9]+M/ {print $5 "\t" $9}'
fi

if [ -d "build/static/css" ]; then
    echo ""
    echo "CSS files:"
    ls -lh build/static/css/*.css | awk '{print $5 "\t" $9}'
fi

# Check for potential optimizations
echo ""
echo "💡 Optimization Suggestions:"
echo "============================"

# Check package.json for heavy dependencies
echo "📦 Checking for heavy dependencies..."
if command -v npx >/dev/null 2>&1; then
    echo "Use 'npx webpack-bundle-analyzer build/static/js/*.js' to see detailed breakdown"
fi

# Look for common performance issues in the codebase
echo ""
echo "🔍 Scanning for common performance issues..."

# Check for unused imports (basic check)
if command -v grep >/dev/null 2>&1; then
    echo "Checking for potential unused imports:"
    grep -r "import.*from" src/ | grep -E "(lodash|moment|react-icons)" | head -5
fi

# Check for large image files
if [ -d "public" ]; then
    echo ""
    echo "🖼️ Large image files in public directory:"
    find public -name "*.jpg" -o -name "*.png" -o -name "*.gif" | xargs ls -lh 2>/dev/null | awk '$5 ~ /[0-9]+[0-9][0-9]K|[0-9]+M/ {print $5 "\t" $9}' | head -5
fi

echo ""
echo "✅ Analysis complete!"
echo ""
echo "🚀 Quick Performance Tips:"
echo "========================="
echo "1. Consider lazy loading routes (✅ already implemented)"
echo "2. Optimize images - use WebP format when possible"
echo "3. Check for unused dependencies in package.json"
echo "4. Consider code splitting for large components"
echo "5. Use React.memo for expensive components"
echo "6. Implement proper caching strategies"
echo ""
echo "Run 'npm run analyze' to see detailed bundle breakdown"
