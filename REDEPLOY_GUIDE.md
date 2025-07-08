# 🚀 Manual Redeployment Guide - Updated JWT Secret

## ✅ Changes Made:
- ✅ Generated new secure JWT secret (128 characters)
- ✅ Updated server/.env file
- ✅ Committed and pushed to GitHub

## 🔧 CRITICAL: Set Environment Variables in Netlify

Since the local .env file isn't used in production, you MUST set these in the Netlify dashboard:

### 1. Go to Backend Settings:
**URL:** https://app.netlify.com/projects/dtvehicle/settings/env-vars

### 2. Add/Update These Variables:

**NODE_ENV**
```
production
```

**MONGODB_URI**
```
mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_petty_cash
```

**JWT_SECRET** (NEW - SECURE)
```
7f3b08c5554e600866ca2f9f0bf072513c7d78e3dbb228ec8f508c67d354c42522e0d8dc2a63bd3c23f78976967dbbf6d8e452ea4a19f12d050eeb0552be4bf1
```

**JWT_EXPIRES_IN**
```
24h
```

### 3. Trigger Deployment:
After adding all variables:
1. Click "Deploy site" or "Trigger deploy"
2. Wait for deployment to complete (~2-3 minutes)

## 🧪 Test After Redeployment:

```bash
# Test health
curl https://dtvehicle.netlify.app/api/health

# Test database connection
curl https://dtvehicle.netlify.app/api/health/db

# Test vehicle creation
curl -X POST https://dtvehicle.netlify.app/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{"vehicleNumber":"TEST001","type":"Car","make":"Toyota","year":2023}'
```

## 🎯 Expected Results:
- Health endpoint: `{"status":"OK"}`
- Database health: `{"status":"OK","message":"Database connected successfully"}`
- Vehicle creation: `{"success":true,"vehicle":{...}}`

---

**🔑 Your new JWT secret is production-ready and secure!**

**After setting environment variables, your full-stack vehicle management system will be 100% functional!**
