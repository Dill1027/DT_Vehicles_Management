#!/bin/bash

# DT Vehicles Management Setup Script
echo "🚗 Setting up DT Vehicles Management System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating server .env file..."
    cp .env.example .env
    echo "⚠️  Please edit server/.env with your configuration"
else
    echo "✅ Server .env file already exists"
fi

cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating client .env file..."
    cp .env.example .env
    echo "✅ Client .env file created"
else
    echo "✅ Client .env file already exists"
fi

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit server/.env with your MongoDB connection string and other settings"
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "Or start them separately:"
echo "   Backend:  npm run server:dev"
echo "   Frontend: npm run client:dev"
echo ""
echo "📚 Check README.md for detailed instructions"
