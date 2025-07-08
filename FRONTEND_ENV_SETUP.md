# 🔧 Frontend Environment Variables Setup Guide

## 📍 Current Status
Your frontend is deployed at: **https://client-8cooubjpq-dill1027s-projects.vercel.app**

## 🎯 Required Environment Variables

### For Vercel Dashboard
Go to [Vercel Dashboard](https://vercel.com/dashboard) → Select your **client** project → Settings → Environment Variables

Add these variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `REACT_APP_API_URL` | `https://server-2y5doibmh-dill1027s-projects.vercel.app/api` | Production |
| `REACT_APP_NAME` | `DT Vehicles Management` | All |
| `REACT_APP_VERSION` | `1.0.0` | All |

## 📋 Step-by-Step Instructions

### Method 1: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Find your `client` project (frontend)
   - Click on it

2. **Navigate to Environment Variables**
   - Click on **Settings** tab
   - Click on **Environment Variables** in the sidebar

3. **Add Each Variable**
   - Click **Add New**
   - Name: `REACT_APP_API_URL`
   - Value: `https://server-2y5doibmh-dill1027s-projects.vercel.app/api`
   - Environment: Select **Production** and **Preview**
   - Click **Save**

4. **Add Optional Variables** (if needed)
   ```
   REACT_APP_NAME = DT Vehicles Management
   REACT_APP_VERSION = 1.0.0
   ```

5. **Redeploy Your Frontend**
   - After adding variables, click **Redeploy** button
   - Or run: `vercel --prod` from the client directory

### Method 2: Via Vercel CLI

```bash
# Navigate to client directory
cd /Users/prabhath/Documents/GitHub/DT_Vehicles_Management/client

# Add environment variables
vercel env add REACT_APP_API_URL production
# When prompted, enter: https://server-2y5doibmh-dill1027s-projects.vercel.app/api

vercel env add REACT_APP_NAME production  
# When prompted, enter: DT Vehicles Management

# Redeploy with new variables
vercel --prod
```

## 🧪 Testing After Setup

### 1. Test API Connection
Open your browser's Developer Tools (F12) and go to:
- https://client-8cooubjpq-dill1027s-projects.vercel.app
- Check the **Console** tab for any API errors
- Check the **Network** tab to see if API calls are going to the correct URL

### 2. Expected API Calls
You should see network requests going to:
```
https://server-2y5doibmh-dill1027s-projects.vercel.app/api/vehicles
https://server-2y5doibmh-dill1027s-projects.vercel.app/api/health
```

### 3. Test Vehicle Operations
- Try adding a new vehicle
- Try viewing existing vehicles
- Check for any error messages

## 🔍 Troubleshooting

### Common Issues:

1. **API calls going to localhost**
   - Environment variables not set correctly
   - Need to redeploy after setting variables

2. **CORS errors**
   - Backend should already allow .vercel.app domains
   - Check browser console for specific error

3. **404 errors on API calls**
   - Check if backend URL is correct
   - Verify backend is deployed and working

### Debug Steps:

1. **Check Environment Variables in Browser**
   ```javascript
   // Open browser console on your frontend and run:
   console.log('API URL:', process.env.REACT_APP_API_URL);
   ```

2. **Verify API URL Format**
   - Should end with `/api` (no trailing slash)
   - Should use `https://` for production

3. **Test Backend Directly**
   ```bash
   curl https://server-2y5doibmh-dill1027s-projects.vercel.app/api/health
   ```

## 📝 Environment Variables Reference

### Development (.env file)
```env
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_NODE_ENV=development
```

### Production (Vercel Dashboard)
```env
REACT_APP_API_URL=https://server-2y5doibmh-dill1027s-projects.vercel.app/api
REACT_APP_NAME=DT Vehicles Management
REACT_APP_VERSION=1.0.0
```

## ✅ Verification Checklist

- [ ] Environment variables added in Vercel Dashboard
- [ ] Frontend redeployed after adding variables
- [ ] API calls going to correct backend URL
- [ ] No CORS errors in browser console
- [ ] Vehicle operations working (add/view/edit)
- [ ] No 404 errors on API endpoints

## 🚀 Next Steps

After setting up frontend environment variables:
1. **Set up backend environment variables** (MongoDB, JWT_SECRET)
2. **Test the complete application**
3. **Monitor for any errors**
4. **Consider setting up custom domain**

---

**Important**: Always redeploy your frontend after adding or changing environment variables in Vercel!
