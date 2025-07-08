# 🚀 **VERCEL DEPLOYMENT - Final Environment Variables**

## 📋 **Database Configuration**
- **MongoDB Atlas**: `mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_petty_cash`
- **Backend URL**: `https://dt-vehicles-management.vercel.app`
- **Frontend URL**: `https://dt-vehicles-management-3kdr.vercel.app` (or your actual URL)

---

## 🖥️ **FRONTEND ENVIRONMENT VARIABLES (Vercel Dashboard)**

### **Settings → Environment Variables → Add:**

```bash
REACT_APP_API_URL=https://dt-vehicles-management.vercel.app/api
REACT_APP_NODE_ENV=production
GENERATE_SOURCEMAP=false
```

**Set for:** Production, Preview, Development

---

## 🔧 **BACKEND ENVIRONMENT VARIABLES (Vercel Dashboard)**

### **Settings → Environment Variables → Add:**

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_petty_cash
JWT_SECRET=dt-vehicles-super-secret-jwt-key-2024-vercel-production
FRONTEND_URL=https://dt-vehicles-management-3kdr.vercel.app
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
JWT_EXPIRE=30d
JWT_EXPIRES_IN=30d
```

**Set for:** Production, Preview, Development

---

## ✅ **DEPLOYMENT CHECKLIST**

### **Step 1: Add Environment Variables**
- [ ] Add **3 frontend variables** to frontend Vercel project
- [ ] Add **10 backend variables** to backend Vercel project
- [ ] Set for all environments (Production, Preview, Development)

### **Step 2: Verify Database Access**
- [ ] Ensure MongoDB Atlas allows connections from anywhere (IP: 0.0.0.0/0)
- [ ] Test connection string locally first

### **Step 3: Deploy & Test**
- [ ] Redeploy both projects (automatic after adding env vars)
- [ ] Test backend health: `https://dt-vehicles-management.vercel.app/api/health`
- [ ] Test frontend loads without errors
- [ ] Test vehicle creation with images
- [ ] Test vehicle viewing with image gallery

---

## 🧪 **QUICK TESTS**

### **Backend API Tests:**
```bash
# Health check
curl https://dt-vehicles-management.vercel.app/api/health

# Get vehicles
curl https://dt-vehicles-management.vercel.app/api/vehicles

# Expected: JSON response, not database errors
```

### **Frontend Tests:**
1. **App loads** without console errors
2. **Vehicle list** displays (may be empty initially)
3. **Add vehicle** form works
4. **Image upload** works
5. **Vehicle details** page works

---

## 🔄 **DATABASE MIGRATION (If Needed)**

### **If you have existing data in local MongoDB:**

```bash
# Export from local database
mongodump --db dt_vehicles_management --out ./backup

# Import to Atlas (dt_petty_cash database)
mongorestore --uri "mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_petty_cash" ./backup/dt_vehicles_management
```

### **Or start fresh:**
- Your app will work with empty database
- Add vehicles through the frontend
- All functionality will work normally

---

## 🎯 **WHAT'S DIFFERENT NOW**

### **✅ What Works:**
- MongoDB Atlas accessible from Vercel servers
- Database connection will succeed
- All API endpoints will work
- Full CRUD operations available
- Image upload and storage functional

### **📝 Database Name:**
- **Local development**: Uses `dt_petty_cash` database
- **Production**: Uses same `dt_petty_cash` database
- **Collection**: `vehicles` (created automatically)

---

## 🚨 **IMPORTANT NOTES**

### **Database Name Difference:**
- Your connection string uses `dt_petty_cash` database
- Your local setup was using `dt_vehicles_management` database
- **This means:** Starting with empty database unless you migrate data

### **Security:**
- MongoDB Atlas cluster allows connections from anywhere
- JWT secret is different for production
- File uploads are properly configured

### **Next Steps:**
1. **Add environment variables** to both Vercel projects
2. **Test deployment** after redeployment
3. **Migrate data** if needed (optional)
4. **Test full functionality** end-to-end

---

## 🔗 **Verification URLs**

- **Backend Health**: https://dt-vehicles-management.vercel.app/api/health
- **Backend Vehicles**: https://dt-vehicles-management.vercel.app/api/vehicles
- **Frontend App**: https://dt-vehicles-management-3kdr.vercel.app
- **MongoDB Atlas**: https://cloud.mongodb.com/

Ready to deploy! 🚀
