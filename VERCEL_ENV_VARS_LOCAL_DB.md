# 🔐 **VERCEL ENVIRONMENT VARIABLES - Local MongoDB Database**

## 📋 **Configuration for Local Database**
- **Database**: `mongodb://localhost:27017/dt_vehicles_management`
- **Backend URL**: `https://dt-vehicles-management.vercel.app`
- **Frontend URL**: `https://dt-vehicles-management-3kdr.vercel.app` (or your actual URL)

---

## 🖥️ **FRONTEND ENVIRONMENT VARIABLES**

### **Add to Vercel Dashboard (Frontend Project):**
Go to **Settings → Environment Variables** and add:

```bash
REACT_APP_API_URL=https://dt-vehicles-management.vercel.app/api
REACT_APP_NODE_ENV=production
GENERATE_SOURCEMAP=false
```

**Environment Types:** Production, Preview, Development

---

## 🔧 **BACKEND ENVIRONMENT VARIABLES**

### **Add to Vercel Dashboard (Backend Project):**
Go to **Settings → Environment Variables** and add:

#### **🔥 CRITICAL VARIABLES:**
```bash
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/dt_vehicles_management
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

#### **📧 OPTIONAL NOTIFICATIONS:**
```bash
ADMIN_EMAIL=admin@deeptec.com
FLEET_MANAGER_EMAIL=fleet@deeptec.com
```

---

## ⚠️ **IMPORTANT DATABASE NOTES**

### **Database Accessibility Issue:**
Your current MongoDB URI (`mongodb://localhost:27017/dt_vehicles_management`) points to a **local database** that **WILL NOT** be accessible from Vercel's servers.

### **Solutions:**

#### **Option 1: Use MongoDB Atlas (Recommended)**
1. Create free account at https://cloud.mongodb.com/
2. Create new cluster
3. Get connection string like: `mongodb+srv://username:password@cluster.mongodb.net/dt_vehicles_management`
4. Replace `MONGODB_URI` with Atlas connection string

#### **Option 2: Export/Import Your Data**
```bash
# Export your local data
mongodump --db dt_vehicles_management --out ./backup

# Then import to MongoDB Atlas or other cloud database
mongorestore --uri "mongodb+srv://username:password@cluster.mongodb.net/dt_vehicles_management" ./backup/dt_vehicles_management
```

#### **Option 3: Use Alternative Cloud Database**
- **Railway**: https://railway.app/
- **PlanetScale**: https://planetscale.com/
- **Supabase**: https://supabase.com/

---

## 🚨 **DEPLOYMENT STATUS WITH LOCAL DB**

**Expected Behavior:**
- ❌ **Backend will FAIL** to connect to database
- ❌ **All API endpoints** will return database connection errors
- ✅ **Frontend will load** but cannot fetch data

**Error you'll see:**
```
MongooseError: Could not connect to MongoDB
```

---

## 🎯 **RECOMMENDED NEXT STEPS**

### **Quick Fix - Use MongoDB Atlas:**

1. **Create MongoDB Atlas Account**
2. **Create Free Cluster**
3. **Get Connection String**
4. **Update Backend Environment Variable:**
   ```bash
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/dt_vehicles_management
   ```
5. **Redeploy Backend**

### **Or Export Your Local Data:**
```bash
# 1. Export from local MongoDB
mongodump --db dt_vehicles_management --out ./local_backup

# 2. Create MongoDB Atlas cluster
# 3. Import to Atlas
mongorestore --uri "your_atlas_connection_string" ./local_backup/dt_vehicles_management
```

---

## 🔧 **CURRENT ENVIRONMENT VARIABLES TO SET**

**Use these exact values in Vercel dashboard:**

### **Frontend:**
```
REACT_APP_API_URL=https://dt-vehicles-management.vercel.app/api
REACT_APP_NODE_ENV=production
GENERATE_SOURCEMAP=false
```

### **Backend:**
```
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/dt_vehicles_management
JWT_SECRET=dt-vehicles-super-secret-jwt-key-2024-vercel-production
FRONTEND_URL=https://dt-vehicles-management-3kdr.vercel.app
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
JWT_EXPIRE=30d
JWT_EXPIRES_IN=30d
```

**⚠️ Note:** Backend will fail with database connection errors until you use a cloud-accessible database.
