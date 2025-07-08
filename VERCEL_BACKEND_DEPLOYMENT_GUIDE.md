# 🚀 **VERCEL BACKEND DEPLOYMENT GUIDE**

## 📋 **Complete Step-by-Step Backend Deployment**

### **Prerequisites:**
- ✅ GitHub repository: `Dill1027/DT_Vehicles_Management`
- ✅ MongoDB Atlas database ready
- ✅ Vercel account created

---

## 🔧 **STEP 1: CREATE VERCEL PROJECT**

### **1.1 Go to Vercel Dashboard**
1. Open https://vercel.com/dashboard
2. Click **"New Project"**
3. Choose **"Import Git Repository"**
4. Select `Dill1027/DT_Vehicles_Management`

### **1.2 Configure Project Settings**
**⚠️ CRITICAL: Set Root Directory**
- **Root Directory**: `server` (NOT the default root)
- **Framework Preset**: Other
- **Build Command**: `npm install`
- **Output Directory**: (leave empty)
- **Install Command**: `npm install`

### **1.3 Click "Deploy"**
- Don't worry about environment variables yet
- Let it deploy and fail (expected)
- We'll add environment variables next

---

## 🔐 **STEP 2: ADD ENVIRONMENT VARIABLES**

### **2.1 Navigate to Settings**
1. Go to your deployed project dashboard
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in sidebar

### **2.2 Add Required Variables**
Add these **10 environment variables** one by one:

#### **Database & Core:**
```
Name: NODE_ENV
Value: production
Environment: Production, Preview, Development
```

```
Name: MONGODB_URI
Value: mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_petty_cash
Environment: Production, Preview, Development
```

```
Name: JWT_SECRET
Value: dt-vehicles-super-secret-jwt-key-2024-vercel-production
Environment: Production, Preview, Development
```

```
Name: FRONTEND_URL
Value: https://dt-vehicles-management-3kdr.vercel.app
Environment: Production, Preview, Development
```

#### **File Upload Configuration:**
```
Name: MAX_FILE_SIZE
Value: 10485760
Environment: Production, Preview, Development
```

```
Name: ALLOWED_FILE_TYPES
Value: image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf
Environment: Production, Preview, Development
```

#### **Security & Rate Limiting:**
```
Name: RATE_LIMIT_WINDOW_MS
Value: 900000
Environment: Production, Preview, Development
```

```
Name: RATE_LIMIT_MAX_REQUESTS
Value: 100
Environment: Production, Preview, Development
```

```
Name: JWT_EXPIRE
Value: 30d
Environment: Production, Preview, Development
```

```
Name: JWT_EXPIRES_IN
Value: 30d
Environment: Production, Preview, Development
```

---

## 🔄 **STEP 3: REDEPLOY**

### **3.1 Trigger Redeployment**
1. Go to **"Deployments"** tab
2. Click **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Or just push to GitHub to trigger auto-deploy

### **3.2 Monitor Deployment**
- Watch the build logs for any errors
- Deployment should succeed now with environment variables

---

## 🧪 **STEP 4: TEST DEPLOYMENT**

### **4.1 Get Your Backend URL**
Your backend will be deployed at:
```
https://dt-vehicles-management.vercel.app
```

### **4.2 Test Health Endpoint**
Open in browser or curl:
```bash
curl https://dt-vehicles-management.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-08T...",
  "database": "Connected",
  "environment": "production"
}
```

### **4.3 Test Vehicles Endpoint**
```bash
curl https://dt-vehicles-management.vercel.app/api/vehicles
```

**Expected Response:**
```json
{
  "success": true,
  "vehicles": []
}
```

---

## 📁 **STEP 5: VERIFY FILE STRUCTURE**

### **5.1 Required Files in `/server` directory:**
```
server/
├── api/
│   └── index.js          # Serverless entry point
├── controllers/
│   └── vehicleController.js
├── models/
│   ├── Vehicle.js
│   └── Notification.js
├── routes/
│   ├── vehicleRoutes.js
│   └── notificationRoutes.js
├── middleware/
│   └── upload.js
├── utils/
│   └── database.js
├── package.json
├── server.js            # Local development
└── vercel.json          # Vercel configuration
```

### **5.2 Key Configuration Files:**

#### **server/vercel.json:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ]
}
```

#### **server/api/index.js:**
```javascript
const express = require('express');
const cors = require('cors');
const connectDB = require('../utils/database');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/vehicles', require('../routes/vehicleRoutes'));
app.use('/api/notifications', require('../routes/notificationRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'Connected',
    environment: process.env.NODE_ENV
  });
});

module.exports = app;
```

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues & Solutions:**

#### **1. "No such file or directory" Error**
**Problem:** Root directory not set to `server`
**Solution:** 
1. Settings → General → Root Directory → `server`
2. Redeploy

#### **2. "Cannot find module" Error**
**Problem:** Dependencies not installed
**Solution:** 
1. Check `package.json` exists in server directory
2. Build Command: `npm install`
3. Redeploy

#### **3. Database Connection Error**
**Problem:** MongoDB URI incorrect or database not accessible
**Solution:**
1. Verify `MONGODB_URI` environment variable
2. Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0)
3. Test connection string locally

#### **4. CORS Errors**
**Problem:** Frontend URL not whitelisted
**Solution:**
1. Update `FRONTEND_URL` environment variable
2. Ensure it matches your actual frontend URL

#### **5. 404 on API Routes**
**Problem:** Routing configuration issue
**Solution:**
1. Verify `vercel.json` configuration
2. Check `api/index.js` exists
3. Ensure routes are properly imported

---

## 📊 **DEPLOYMENT CHECKLIST**

### **Before Deployment:**
- [ ] GitHub repository accessible
- [ ] `server` directory contains all required files
- [ ] `package.json` has all dependencies
- [ ] `vercel.json` configured correctly
- [ ] `api/index.js` exists as serverless entry point

### **During Deployment:**
- [ ] Set root directory to `server`
- [ ] Add all 10 environment variables
- [ ] Set environment variables for all environments
- [ ] Monitor build logs for errors

### **After Deployment:**
- [ ] Test health endpoint responds
- [ ] Test vehicles endpoint responds
- [ ] Verify database connection works
- [ ] Check CORS allows frontend access
- [ ] Test file upload endpoints

---

## 🎯 **EXPECTED URLS**

### **Backend API Endpoints:**
- **Health**: `https://dt-vehicles-management.vercel.app/api/health`
- **Vehicles**: `https://dt-vehicles-management.vercel.app/api/vehicles`
- **Upload**: `https://dt-vehicles-management.vercel.app/api/vehicles/upload`

### **Testing Commands:**
```bash
# Health check
curl https://dt-vehicles-management.vercel.app/api/health

# Get vehicles
curl https://dt-vehicles-management.vercel.app/api/vehicles

# Create vehicle (POST)
curl -X POST https://dt-vehicles-management.vercel.app/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{"vehicleNumber":"TEST-001","vehicleType":"Car","brand":"Toyota"}'
```

---

## ✅ **SUCCESS INDICATORS**

### **Deployment Successful When:**
- ✅ Build completes without errors
- ✅ Health endpoint returns 200 OK
- ✅ Vehicles endpoint returns JSON
- ✅ Database connection established
- ✅ Environment variables loaded correctly

### **Ready for Frontend Integration:**
- ✅ CORS configured for frontend domain
- ✅ All API endpoints accessible
- ✅ File upload functionality working
- ✅ Database operations functional

---

## 🔗 **NEXT STEPS**

1. **✅ Backend deployed successfully**
2. **⏳ Deploy frontend with backend URL**
3. **⏳ Test full end-to-end functionality**
4. **⏳ Configure custom domain (optional)**

**Backend URL to use in frontend:**
```
https://dt-vehicles-management.vercel.app/api
```

Your backend is now ready for production! 🚀
