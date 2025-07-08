# 🚀 Vercel Deployment Checklist

## Pre-Deployment Checklist

### ✅ Prerequisites
- [ ] Vercel account created (https://vercel.com)
- [ ] Vercel CLI installed (`npm install -g vercel`)
- [ ] MongoDB database ready (MongoDB Atlas recommended)
- [ ] Project code committed to Git repository

### ✅ Environment Variables Ready
- [ ] **Backend Variables:**
  - `MONGODB_URI` - Your MongoDB connection string
  - `JWT_SECRET` - A secure random string for JWT tokens
  - `NODE_ENV=production`

- [ ] **Frontend Variables:**
  - `REACT_APP_API_URL` - Your backend URL (will be available after backend deployment)

### ✅ Configuration Files
- [ ] `server/vercel.json` exists ✅
- [ ] `client/vercel.json` exists ✅
- [ ] `server/api/index.js` exists ✅
- [ ] Package.json files have correct scripts ✅

## 🎯 Deployment Steps

### Option 1: Quick Deployment (Recommended)
```bash
./quick-deploy-vercel.sh
```

### Option 2: Manual Deployment

#### Step 1: Deploy Backend
```bash
cd server
vercel --prod
```

#### Step 2: Deploy Frontend
```bash
cd client
vercel --prod
```

## 🔧 Post-Deployment Setup

### 1. Set Environment Variables
1. Go to Vercel Dashboard
2. Select your backend project
3. Go to Settings → Environment Variables
4. Add the backend environment variables
5. Select your frontend project
6. Add the frontend environment variables

### 2. Test Your Application
- [ ] Backend API health check: `https://your-backend.vercel.app/api/health`
- [ ] Frontend loads correctly
- [ ] Can add/view vehicles
- [ ] No console errors

### 3. Database Connection
- [ ] MongoDB Atlas cluster is running
- [ ] Database user has proper permissions
- [ ] Network access allows all IPs (0.0.0.0/0) for Vercel

## 🐛 Troubleshooting

### Common Issues:
- **CORS Errors**: Check CORS configuration in server
- **API Not Found**: Verify REACT_APP_API_URL is correct
- **Database Connection**: Check MongoDB connection string
- **Build Errors**: Review Vercel function logs

### Debug Commands:
```bash
# Test backend API
curl https://your-backend.vercel.app/api/health

# Check Vercel logs
vercel logs

# Redeploy if needed
vercel --prod
```

## 📱 URLs to Save
- Backend URL: `https://your-backend-name.vercel.app`
- Frontend URL: `https://your-frontend-name.vercel.app`
- Vercel Dashboard: `https://vercel.com/dashboard`

## 🎉 Success Criteria
- [ ] Backend API responds to health check
- [ ] Frontend loads without errors
- [ ] Can perform CRUD operations on vehicles
- [ ] Database operations work correctly
- [ ] Images upload successfully (if applicable)

---

💡 **Pro Tips:**
- Use meaningful project names in Vercel
- Set up custom domains for production
- Monitor your function usage in Vercel dashboard
- Keep environment variables secure
- Test thoroughly before sharing with users
