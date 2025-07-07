# 🚀 VERCEL DEPLOYMENT GUIDE - Complete Setup

## 📋 **Overview**
This guide will help you deploy both frontend and backend to Vercel with all required environment variables.

**Your URLs:**
- **Backend**: `https://dt-vehicles-management.vercel.app`
- **Frontend**: `https://dt-vehicles-management-3kdr.vercel.app` (or new URL)

---

## 🔧 **BACKEND DEPLOYMENT (Server)**

### **Step 1: Create Backend Project**
1. Go to https://vercel.com/dashboard
2. Click **"New Project"**
3. Import `Dill1027/DT_Vehicles_Management`
4. **Set Root Directory**: `server` ⚠️ IMPORTANT!
5. Framework: Other
6. Build Command: `npm install`
7. Output Directory: (leave empty)

### **Step 2: Backend Environment Variables**
Add these to **Settings → Environment Variables**:

#### **🔥 CRITICAL VARIABLES:**
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_petty_cash
JWT_SECRET=dt-vehicles-super-secret-jwt-key-2024-vercel-production
FRONTEND_URL=https://dt-vehicles-management-3kdr.vercel.app
```

#### **📁 FILE UPLOAD:**
```bash
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf
```

#### **🚦 RATE LIMITING:**
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
JWT_EXPIRE=30d
```

#### **📧 NOTIFICATIONS (Optional):**
```bash
ADMIN_EMAIL=admin@deeptec.com
FLEET_MANAGER_EMAIL=fleet@deeptec.com
ENGINEERING_EMAIL=engineering@deeptec.com
OPERATIONS_EMAIL=operations@deeptec.com
ADMINISTRATION_EMAIL=admin@deeptec.com
SALES_EMAIL=sales@deeptec.com
MAINTENANCE_EMAIL=maintenance@deeptec.com
EXECUTIVE_EMAIL=executive@deeptec.com
```

### **Step 3: Deploy Backend**
- Click **"Deploy"**
- Wait for completion
- Test: `https://your-backend-url.vercel.app/api/health`

---

## 🎨 **FRONTEND DEPLOYMENT (Client)**

### **Step 1: Create Frontend Project**
1. Go to https://vercel.com/dashboard
2. Click **"New Project"** (again, separate project)
3. Import `Dill1027/DT_Vehicles_Management`
4. **Set Root Directory**: `client` ⚠️ IMPORTANT!
5. Framework: Create React App
6. Build Command: `npm run build`
7. Output Directory: `build`

### **Step 2: Frontend Environment Variables**
Add these to **Settings → Environment Variables**:

#### **🔗 API CONFIGURATION:**
```bash
REACT_APP_API_URL=https://dt-vehicles-management.vercel.app/api
```

#### **⚡ BUILD OPTIMIZATION:**
```bash
NODE_ENV=production
REACT_APP_NODE_ENV=production
GENERATE_SOURCEMAP=false
INLINE_RUNTIME_CHUNK=false
BUILD_PATH=build
```

### **Step 3: Deploy Frontend**
- Click **"Deploy"**
- Wait for completion
- Test: `https://your-frontend-url.vercel.app`

---

## 📝 **ENVIRONMENT VARIABLES CHECKLIST**

### **Backend Project (`dt-vehicles-management`):**
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI=mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_petty_cash`
- [ ] `JWT_SECRET=dt-vehicles-super-secret-jwt-key-2024-vercel-production`
- [ ] `FRONTEND_URL=https://dt-vehicles-management-3kdr.vercel.app`
- [ ] `MAX_FILE_SIZE=10485760`
- [ ] `ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf`
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=100`
- [ ] `JWT_EXPIRE=30d`

### **Frontend Project (`dt-vehicles-management-3kdr` or new):**
- [ ] `REACT_APP_API_URL=https://dt-vehicles-management.vercel.app/api`
- [ ] `NODE_ENV=production`
- [ ] `REACT_APP_NODE_ENV=production`
- [ ] `GENERATE_SOURCEMAP=false`
- [ ] `INLINE_RUNTIME_CHUNK=false`
- [ ] `BUILD_PATH=build`

---

## 🧪 **TESTING YOUR DEPLOYMENT**

### **Test Backend:**
```bash
# Health check
curl https://dt-vehicles-management.vercel.app/api/health

# Should return:
# {"status":"OK","message":"DT Vehicles Management API is running",...}

# Test vehicles endpoint
curl https://dt-vehicles-management.vercel.app/api/vehicles

# Should return vehicles data or empty array
```

### **Test Frontend:**
1. Visit your frontend URL
2. Open browser console (F12)
3. Look for: `🔗 API Configuration` logs
4. Should show your backend URL
5. Try creating a vehicle with images

---

## 🔄 **IF DEPLOYMENT FAILS**

### **Backend Issues:**
1. Check Function logs in Vercel dashboard
2. Verify all environment variables are set
3. Ensure MongoDB URI is correct
4. Check `server/vercel.json` configuration

### **Frontend Issues:**
1. Check build logs
2. Verify `REACT_APP_API_URL` points to backend
3. Ensure `client/vercel.json` exists
4. Check for console errors

### **CORS Issues:**
1. Update `FRONTEND_URL` in backend environment
2. Wait for automatic redeploy
3. Test again

---

## 📱 **QUICK DEPLOYMENT COMMANDS**

### **Using Vercel CLI (Alternative):**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy Backend
cd server
vercel --prod
# Set root directory to 'server' when prompted

# Deploy Frontend
cd ../client
vercel --prod
# Set root directory to 'client' when prompted
```

---

## 🎯 **FINAL CHECKLIST**

- [ ] Backend deployed and responding to health check
- [ ] Frontend deployed and accessible
- [ ] All environment variables added
- [ ] API calls working from frontend to backend
- [ ] Image upload functionality working
- [ ] Vehicle creation/editing working
- [ ] No CORS errors in browser console

---

## 🆘 **TROUBLESHOOTING**

### **Common Issues:**

**1. Function Invocation Failed:**
- Check environment variables
- Verify MongoDB connection string
- Look at Function logs in Vercel

**2. CORS Errors:**
- Update `FRONTEND_URL` in backend
- Wait for redeploy
- Clear browser cache

**3. API Not Found (404):**
- Check `REACT_APP_API_URL` in frontend
- Verify backend deployment
- Test backend health endpoint

**4. Images Not Loading:**
- Check file size limits
- Verify image upload endpoints
- Check console for errors

### **Support URLs:**
- Backend Health: `https://dt-vehicles-management.vercel.app/api/health`
- Frontend: Your frontend deployment URL
- Vercel Dashboard: https://vercel.com/dashboard

---

**🎉 Once both deployments are complete, your DT Vehicles Management System will be fully operational on Vercel!**
