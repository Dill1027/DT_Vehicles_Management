# Admin User Creation Scripts

This directory contains scripts to create admin users for the DT Vehicles Management System.

## 📋 Available Scripts

### 1. `createAdmin.js` - Direct Database Creation
Creates a single admin user directly in the MongoDB database.

**Usage:**
```bash
# From server directory
node scripts/createAdmin.js

# Or using npm script
npm run create-admin
```

**Features:**
- ✅ Connects directly to MongoDB
- ✅ Creates admin user with predefined credentials
- ✅ Checks for existing admin to prevent duplicates
- ✅ Handles errors gracefully

### 2. `seedDatabase.js` - Multiple Test Users
Creates multiple users with different roles for testing purposes.

**Usage:**
```bash
# From server directory
node scripts/seedDatabase.js

# Or using npm script
npm run seed-db

# For help
node scripts/seedDatabase.js --help
```

**Features:**
- ✅ Creates 5 users with different roles (Admin, Manager, Driver, Mechanic, Viewer)
- ✅ Skips existing users
- ✅ Comprehensive role-based permissions
- ✅ Detailed output and credentials display

### 3. `createAdminAPI.js` - Via Registration API
Creates admin user using the registration API endpoint.

**Usage:**
```bash
# Make sure server is running first
npm run dev

# Then in another terminal
node scripts/createAdminAPI.js

# Or using npm script
npm run create-admin-api
```

**Features:**
- ✅ Uses the actual registration API
- ✅ Tests API connectivity
- ✅ Handles network errors
- ✅ Validates server response

## 🔐 Default Credentials

### Admin User (All Scripts)
- **Email:** `admin@deeptec.com`
- **Password:** `admin@123`
- **Role:** `Admin`
- **Department:** `Administration`
- **Employee ID:** `ADMIN001`

### Additional Users (seedDatabase.js only)
| Role     | Email                | Password    | Employee ID |
|----------|---------------------|-------------|-------------|
| Admin    | admin@deeptec.com   | admin@123    | ADMIN001    |
| Manager  | manager@deeptec.com | manager123  | MGR001      |
| Driver   | driver@deeptec.com  | driver123   | DRV001      |
| Mechanic | mechanic@deeptec.com| mechanic123 | MECH001     |
| Viewer   | viewer@deeptec.com  | viewer123   | VIEW001     |

## 🚀 Quick Start

1. **First Time Setup (Recommended):**
   ```bash
   cd server
   npm run seed-db
   ```

2. **Just Admin User:**
   ```bash
   cd server
   npm run create-admin
   ```

3. **Via API (Server must be running):**
   ```bash
   # Terminal 1: Start server
   npm run dev
   
   # Terminal 2: Create admin
   npm run create-admin-api
   ```

## 🛠️ Configuration

### Environment Variables
Make sure your `.env` file is configured:

```env
# Required
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dt_vehicles
JWT_SECRET=your_jwt_secret_key

# Optional (for API script)
API_BASE_URL=http://localhost:5000
```

### Database Connection
All scripts use the `MONGODB_URI` from your `.env` file. Make sure it's properly configured.

## 🔒 Security Notes

⚠️ **Important Security Considerations:**

1. **Change Default Passwords:** Always change the default passwords after first login
2. **Production Use:** Never use these scripts in production with default credentials
3. **Environment:** These scripts are intended for development and testing only
4. **Permissions:** Admin users have full system access

## 🐛 Troubleshooting

### Common Issues

**1. "MongoDB connection failed"**
- Check your `MONGODB_URI` in `.env`
- Ensure MongoDB is running (local) or accessible (cloud)
- Verify network connectivity

**2. "User already exists"**
- Check if admin already exists in database
- Use different email or delete existing user
- Scripts will skip existing users safely

**3. "API connection failed" (createAdminAPI.js)**
- Make sure server is running (`npm run dev`)
- Check if port 5000 is available
- Verify `API_BASE_URL` in environment

**4. "Validation errors"**
- Check if all required fields are provided
- Verify email format is correct
- Ensure password meets requirements (min 6 characters)

### Debug Mode
For more detailed logging, set environment variable:
```bash
DEBUG=* node scripts/createAdmin.js
```

## 📞 Support

If you encounter issues:

1. Check the error messages carefully
2. Verify your environment configuration
3. Ensure all dependencies are installed (`npm install`)
4. Check database connectivity
5. Refer to the main project documentation

## 🔄 Script Workflow

### createAdmin.js Flow
```
1. Load environment variables
2. Connect to MongoDB
3. Check for existing admin
4. Create new admin user
5. Display credentials
6. Disconnect and exit
```

### seedDatabase.js Flow
```
1. Load environment variables
2. Connect to MongoDB
3. Loop through seed users
4. Check for existing users
5. Create new users only
6. Display comprehensive summary
7. Disconnect and exit
```

### createAdminAPI.js Flow
```
1. Load environment variables
2. Make HTTP request to registration API
3. Handle response/errors
4. Display result
5. Exit
```

## 📄 License

These scripts are part of the DT Vehicles Management System and follow the same license.
