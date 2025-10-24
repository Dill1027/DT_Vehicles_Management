# 🚗 DT Vehicles Management System

A comprehensive vehicle fleet management system built with React.js frontend and Node.js backend, designed specifically for Deep Tec Engineering's vehicle fleet operations.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🎯 Overview

The DT Vehicles Management System is a modern web application designed to streamline vehicle fleet operations for Deep Tec Engineering. It provides comprehensive tools for vehicle tracking, maintenance scheduling, insurance management, license renewal tracking, and operational reporting.

### Key Capabilities:
- **Fleet Dashboard**: Real-time overview of vehicle status and alerts
- **Vehicle Management**: Complete CRUD operations for vehicle records
- **Alert System**: Automated notifications for insurance and license renewals
- **Reporting**: Comprehensive reports with PDF export functionality
- **Multi-platform**: Responsive design for desktop and mobile devices

## ✨ Features

### 🚙 Vehicle Management
- **Vehicle Registration**: Add new vehicles with detailed specifications
- **Vehicle Profiles**: Comprehensive vehicle information including make, model, year, type
- **Status Tracking**: Monitor vehicle availability, usage, and maintenance status
- **Document Management**: Upload and manage vehicle documents and images

### 📊 Dashboard & Analytics
- **Real-time Statistics**: Live vehicle counts and status overview
- **Alert Monitoring**: Insurance and license expiration alerts
- **Quick Actions**: Fast access to frequently used functions
- **Visual Charts**: Data visualization with Recharts integration

### 🔔 Notification System
- **Insurance Alerts**: Automated notifications for expiring insurance policies
- **License Renewals**: Tracking and alerts for license renewals
- **Maintenance Reminders**: Schedule and track maintenance activities
- **Custom Notifications**: User-defined alert parameters

### 📄 Reporting & Export
- **PDF Reports**: Generate detailed reports with jsPDF
- **Data Export**: Export vehicle data in multiple formats
- **Custom Reports**: Configurable report parameters
- **Print-friendly**: Optimized layouts for printing

### 🏢 Department Management
- **Multi-department Support**: Engineering, Operations, Administration, Sales, Maintenance, Executive
- **Role-based Access**: Different access levels per department
- **Vehicle Assignment**: Assign vehicles to specific departments

## 🛠️ Technology Stack

### Frontend
- **React 18.2.0** - Modern UI library with hooks and context
- **React Router v6** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **React Query** - Server state management
- **React Hook Form** - Form validation and management
- **Heroicons/Lucide React** - Icon libraries
- **React Hot Toast** - Toast notifications
- **jsPDF & AutoTable** - PDF generation
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB with Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting
- **Nodemailer** - Email functionality
- **PDFKit** - Server-side PDF generation

### Development Tools
- **Concurrently** - Run multiple commands
- **Nodemon** - Development server auto-restart
- **React Scripts** - React build tools
- **ESLint** - Code linting

## 📁 Project Structure

```
DT_Vehicles_Management/
├── client/                     # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Layout.js       # Main layout wrapper
│   │   │   ├── Navigation.js   # Navigation component
│   │   │   ├── VehicleCard.js  # Vehicle display card
│   │   │   ├── VehicleModal.js # Vehicle details modal
│   │   │   └── LoadingSpinner.js
│   │   ├── pages/              # Application pages
│   │   │   ├── Dashboard.js    # Main dashboard
│   │   │   ├── Vehicles.js     # Vehicle listing
│   │   │   ├── AddVehicle.js   # Add new vehicle
│   │   │   ├── EditVehicle.js  # Edit vehicle details
│   │   │   ├── VehicleDetail.js # Vehicle detail view
│   │   │   └── Reports.js      # Reports and analytics
│   │   ├── services/           # API and business logic
│   │   │   ├── api.js          # API configuration
│   │   │   ├── vehicleService.js # Vehicle operations
│   │   │   ├── notificationService.js # Notifications
│   │   │   └── reportService.js # Report generation
│   │   ├── utils/              # Utility functions
│   │   │   ├── constants.js    # Application constants
│   │   │   ├── helpers.js      # Helper functions
│   │   │   └── performanceMonitor.js
│   │   ├── App.js              # Main application component
│   │   └── index.js            # Application entry point
│   ├── public/                 # Static assets
│   ├── build/                  # Production build output
│   ├── package.json            # Frontend dependencies
│   └── tailwind.config.js      # TailwindCSS configuration
├── server/                     # Node.js backend application
│   ├── controllers/            # Request handlers
│   │   └── vehicleController.js
│   ├── middleware/             # Custom middleware
│   │   ├── corsMiddleware.js   # CORS configuration
│   │   └── upload.js           # File upload handling
│   ├── models/                 # Database models
│   │   ├── Vehicle.js          # Vehicle schema
│   │   └── Notification.js     # Notification schema
│   ├── routes/                 # API routes
│   │   ├── vehicleRoutes.js    # Vehicle endpoints
│   │   └── notificationRoutes.js # Notification endpoints
│   ├── services/               # Business logic
│   │   └── notificationService.js
│   ├── scripts/                # Utility scripts
│   │   ├── seedMongoDB.js      # Database seeding
│   │   ├── createDefaultAdmin.js # Admin setup
│   │   └── clearDatabase.js    # Database cleanup
│   ├── utils/                  # Server utilities
│   │   ├── database.js         # Database connection
│   │   ├── email.js            # Email functionality
│   │   └── pdfGenerator.js     # PDF generation
│   ├── server.js               # Main server file
│   ├── dev-server.js           # Development server
│   └── package.json            # Backend dependencies
├── package.json                # Root package configuration
├── vercel.json                 # Vercel deployment config
├── deploy.sh                   # Deployment script
└── README.md                   # This file
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 16.0.0 or higher)
- **npm** (version 8.0.0 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (for version control)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/Dill1027/DT_Vehicles_Management.git
cd DT_Vehicles_Management
```

### 2. Install Dependencies
Install all dependencies for both frontend and backend:
```bash
npm run install:all
```

Or install separately:
```bash
# Install root dependencies
npm install

# Install backend dependencies
npm run install:server

# Install frontend dependencies
npm run install:client
```

### 3. Environment Configuration
Copy the example environment files and configure them:

#### Backend Environment (server/.env)
```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/dt_vehicles_management
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dt_vehicles_management

# Server Configuration
PORT=5002
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf
```

#### Frontend Environment (client/.env)
```bash
cd client
cp .env.example .env
```

Edit `client/.env`:
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5002/api
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

## ⚙️ Configuration

### Database Setup

#### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb/brew/mongodb-community
   
   # Linux (systemd)
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

#### Option 2: MongoDB Atlas (Cloud)
1. Create an account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### Initial Data Setup
Seed the database with sample data:
```bash
cd server
npm run seed-db
```

Create an admin user:
```bash
npm run create-admin
```

## 🎮 Running the Application

### Development Mode

#### Start Both Frontend and Backend Simultaneously
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5002

#### Start Individually

**Backend Only:**
```bash
npm run server:dev
# or
cd server && npm run dev
```

**Frontend Only:**
```bash
npm run client
# or
cd client && npm start
```

### Production Mode

#### Build the Frontend
```bash
npm run build
```

#### Start Production Server
```bash
npm start
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

The project is configured for Vercel deployment with separate frontend and backend hosting.

#### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration from `vercel.json`
3. Set environment variables in Vercel dashboard

#### Manual Deployment
```bash
# Deploy backend
cd server
./deploy-backend.sh

# Deploy frontend
cd client
./deploy-frontend.sh
```

### Environment Variables for Production
Set these in your deployment platform:

**Backend:**
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS` (if using email features)

**Frontend:**
- `REACT_APP_API_URL` (your backend URL)
- `REACT_APP_ENV=production`

## 📚 API Documentation

### Base URL
- Development: `http://localhost:5002/api`
- Production: `https://your-backend-url.vercel.app/api`

### Authentication
The API uses JWT tokens for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Vehicle Endpoints

#### Get All Vehicles
```http
GET /api/vehicles
```

#### Get Vehicle by ID
```http
GET /api/vehicles/:id
```

#### Create New Vehicle
```http
POST /api/vehicles
Content-Type: application/json

{
  "vehicleNumber": "ABC-1234",
  "make": "Toyota",
  "model": "Corolla",
  "year": 2023,
  "type": "Car",
  "department": "Engineering"
}
```

#### Update Vehicle
```http
PUT /api/vehicles/:id
Content-Type: application/json
```

#### Delete Vehicle
```http
DELETE /api/vehicles/:id
```

### Notification Endpoints

#### Get All Notifications
```http
GET /api/notifications
```

#### Create Notification
```http
POST /api/notifications
Content-Type: application/json
```

#### Mark Notification as Read
```http
PATCH /api/notifications/:id/read
```

## 🤝 Contributing

We welcome contributions to improve the DT Vehicles Management System!

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Use ESLint for JavaScript linting
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic

### Testing
```bash
# Run frontend tests
cd client && npm test

# Run backend tests (when available)
cd server && npm test
```

## 🔧 Troubleshooting

### Common Issues

#### CORS Errors
If you encounter CORS errors:
1. Check that the backend is running on the correct port (5002)
2. Verify `REACT_APP_API_URL` in frontend `.env`
3. Ensure CORS is properly configured in `server/server.js`

#### Database Connection Issues
1. Verify MongoDB is running
2. Check your `MONGODB_URI` in `.env`
3. Ensure database credentials are correct

#### Port Conflicts
If port 3000 or 5002 is in use:
```bash
# Kill processes on specific port
lsof -ti:3000 | xargs kill -9
lsof -ti:5002 | xargs kill -9
```

#### Build Issues
Clear cache and reinstall:
```bash
npm run clean
npm run install:all
```

### Development Tips

#### Performance Monitoring
The application includes built-in performance monitoring. Check browser console for performance metrics.

#### Cache Management
Clear application cache:
```bash
# Frontend build cache
cd client && rm -rf build

# Node modules
npm run clean
npm run install:all
```

#### Database Management
```bash
# Clear all data
cd server && node scripts/clearDatabase.js

# Reseed database
npm run seed-db
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Deep Tec Engineering Team** - *Initial work*
- **Your Name** - *Development*

## 🙏 Acknowledgments

- React team for the amazing frontend framework
- MongoDB team for the robust database solution
- All contributors and testers
- Deep Tec Engineering for project requirements and feedback

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/Dill1027/DT_Vehicles_Management/issues)
3. Create a new issue with detailed description
4. Contact the development team

---

**Built with ❤️ for Deep Tec Engineering**

*Last updated: October 2025*