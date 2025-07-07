# 🔐 **VERCEL ENVIRONMENT VARIABLES - Complete Setup Guide**

## 📋 **Quick Reference**
- **Backend URL**: `https://dt-vehicles-management.vercel.app`
- **Frontend URL**: `https://dt-vehicles-management-3kdr.vercel.app` (or your new URL)

---

## 🖥️ **FRONTEND ENVIRONMENT VARIABLES**

### **Vercel Dashboard Setup:**
1. Go to https://vercel.com/dashboard
2. Open your **frontend** project
3. Navigate to **Settings → Environment Variables**
4. Add these variables:

```bash
REACT_APP_API_URL=https://dt-vehicles-management.vercel.app/api
REACT_APP_NODE_ENV=production
GENERATE_SOURCEMAP=false
```

### **Environment Types:**
- Set all variables for: **Production**, **Preview**, and **Development**

---

## 🔧 **BACKEND ENVIRONMENT VARIABLES**

### **Vercel Dashboard Setup:**
1. Go to https://vercel.com/dashboard
2. Open your **backend** project (with `server` as root directory)
3. Navigate to **Settings → Environment Variables**
4. Add these variables:

#### **🔥 CRITICAL VARIABLES:**
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_petty_cash
JWT_SECRET=dt-vehicles-super-secret-jwt-key-2024-vercel-production
FRONTEND_URL=https://dt-vehicles-management-3kdr.vercel.app
```

#### **📁 FILE UPLOAD CONFIGURATION:**
```bash
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf
```

#### **🚦 SECURITY & RATE LIMITING:**
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
JWT_EXPIRE=30d
JWT_EXPIRES_IN=30d
```

#### **📧 NOTIFICATIONS (Optional):**
```bash
ADMIN_EMAIL=admin@deeptec.com
FLEET_MANAGER_EMAIL=fleet@deeptec.com
```

---

## ⚡ **DEPLOYMENT STEPS**

### **1. Backend Deployment:**
```bash
# Your backend should already be deployed at:
# https://dt-vehicles-management.vercel.app

# Test the health endpoint:
curl https://dt-vehicles-management.vercel.app/api/health
```

### **2. Frontend Deployment:**
1. Make sure you've added all frontend environment variables
2. Redeploy from Vercel dashboard or push to GitHub
3. Test the deployment

### **3. Update Frontend API URL (if needed):**
If your frontend URL changed, update the backend `FRONTEND_URL` variable:
```bash
FRONTEND_URL=https://your-new-frontend-url.vercel.app
```

---

## 🧪 **TESTING CHECKLIST**

### **Backend Tests:**
- [ ] Health endpoint: `GET /api/health`
- [ ] Vehicles endpoint: `GET /api/vehicles`
- [ ] CORS is working from frontend domain

### **Frontend Tests:**
- [ ] App loads without errors
- [ ] Can fetch vehicles from backend
- [ ] Image upload works
- [ ] All pages navigate correctly

### **Integration Tests:**
- [ ] Create new vehicle with images
- [ ] View vehicle details with image gallery
- [ ] Edit vehicle and update images
- [ ] All CRUD operations work

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

1. **CORS Errors:**
   - Ensure `FRONTEND_URL` is set correctly in backend
   - Check browser console for exact error

2. **API Connection Failed:**
   - Verify `REACT_APP_API_URL` points to correct backend
   - Test backend endpoint directly

3. **MongoDB Connection Issues:**
   - Verify `MONGODB_URI` is correct
   - Check MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0)

4. **Environment Variables Not Working:**
   - Redeploy after adding variables
   - Check variable names are exact (case-sensitive)

---

## 📝 **NEXT STEPS**

1. ✅ Backend is deployed and working
2. ⏳ Add frontend environment variables
3. ⏳ Deploy/redeploy frontend
4. ⏳ Test full functionality
5. ⏳ Update any hardcoded URLs

---

## 🔗 **Quick Links**
- [Backend Vercel Project](https://vercel.com/dashboard)
- [Frontend Vercel Project](https://vercel.com/dashboard)
- [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
- [GitHub Repository](https://github.com/Dill1027/DT_Vehicles_Management)
