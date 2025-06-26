# DT Vehicles Management System

A comprehensive vehicle management system built with React frontend and Node.js backend, designed to help organizations track and manage their fleet of vehicles efficiently.

## Features

### Frontend (React)
- 🚗 **Vehicle Management**: Add, edit, view, and delete vehicles
- 📊 **Dashboard**: Real-time statistics and overview
- 🔍 **Search & Filter**: Advanced filtering by status, make, model, year
- 📱 **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- 🔄 **Real-time Updates**: Live data synchronization
- 📋 **Maintenance Tracking**: Schedule and track vehicle maintenance

### Backend (Node.js)
- 🔐 **Authentication & Authorization**: JWT-based security
- 📄 **RESTful API**: Well-structured API endpoints
- 🗄️ **MongoDB Integration**: Efficient data storage with Mongoose
- 📤 **File Upload**: Support for vehicle images and documents
- 🛡️ **Security**: Rate limiting, input validation, CORS protection
- 📊 **Statistics**: Vehicle analytics and reporting

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Helmet** - Security middleware

## Project Structure

```
DT_Vehicles_Management/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Navigation.js
│   │   │   ├── VehicleCard.js
│   │   │   └── VehicleModal.js
│   │   ├── pages/          # Page components
│   │   │   ├── Dashboard.js
│   │   │   ├── VehicleList.js
│   │   │   └── AddVehicle.js
│   │   ├── services/       # API service functions
│   │   │   └── vehicleService.js
│   │   ├── utils/          # Utility functions
│   │   │   └── helpers.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   │   ├── vehicleController.js
│   │   ├── userController.js
│   │   └── maintenanceController.js
│   ├── models/            # Database models
│   │   ├── Vehicle.js
│   │   ├── User.js
│   │   └── Maintenance.js
│   ├── routes/            # API routes
│   │   ├── vehicleRoutes.js
│   │   ├── userRoutes.js
│   │   └── maintenanceRoutes.js
│   ├── middleware/        # Custom middleware
│   │   ├── auth.js
│   │   └── upload.js
│   ├── utils/             # Utility functions
│   │   ├── database.js
│   │   ├── auth.js
│   │   ├── fileUpload.js
│   │   ├── email.js
│   │   └── helpers.js
│   ├── server.js          # Entry point
│   ├── package.json
│   └── .env.example
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/DT_Vehicles_Management.git
   cd DT_Vehicles_Management
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   
   # Create environment file
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   
   Create `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dt_vehicles
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   
   # Email configuration (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_email_password
   ```

5. **Start the development servers**
   
   Backend (runs on http://localhost:5000):
   ```bash
   cd server
   npm run dev
   ```
   
   Frontend (runs on http://localhost:3000):
   ```bash
   cd client
   npm start
   ```

## API Endpoints

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `GET /api/vehicles/stats` - Get vehicle statistics
- `PATCH /api/vehicles/:id/status` - Update vehicle status

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Maintenance
- `GET /api/maintenance` - Get all maintenance records
- `POST /api/maintenance` - Create maintenance record
- `GET /api/maintenance/:id` - Get maintenance record by ID
- `PUT /api/maintenance/:id` - Update maintenance record

## Usage

### Adding a Vehicle
1. Navigate to "Add Vehicle" page
2. Fill in vehicle details (ID, make, model, year, etc.)
3. Upload vehicle images (optional)
4. Save the vehicle

### Managing Vehicles
1. View all vehicles on the "Vehicles" page
2. Use search and filters to find specific vehicles
3. Click "Edit" to modify vehicle details
4. Click "Delete" to remove a vehicle

### Dashboard
- View vehicle statistics (total, available, in-use, maintenance)
- See recent vehicles and their status
- Access quick actions

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Helmet for security headers
- File upload restrictions

## Performance Optimizations

- React Query for efficient data fetching
- Debounced search functionality
- Pagination for large datasets
- Image optimization
- Database indexing
- Connection pooling

## Deployment

### Frontend (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables

### Backend (Heroku/Railway)
1. Configure production environment variables
2. Set up MongoDB Atlas or production database
3. Deploy using Git or Docker

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **CORS Issues**
   - Update CORS configuration in server
   - Check frontend API URLs

3. **File Upload Issues**
   - Verify upload directory permissions
   - Check file size limits
   - Ensure multer configuration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email your-email@example.com or create an issue in the GitHub repository.

## Acknowledgments

- Thanks to all contributors
- Built with modern web technologies
- Inspired by fleet management needs

---

**Version**: 1.0.0  
**Last Updated**: June 2025