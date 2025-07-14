# Separate Vercel Deployment Guide for DT Vehicles Management

## Overview

This guide covers deploying the backend and frontend as **separate projects** on Vercel for better scalability, independent scaling, and easier maintenance.

## Architecture

- **Backend**: Node.js API deployed as Vercel Functions
- **Frontend**: React SPA deployed as static site
- **Database**: MongoDB Atlas (separate cloud service)

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **MongoDB Atlas**: Set up a cloud MongoDB database
4. **Vercel CLI** (optional): `npm i -g vercel`

---

## Step 1: Deploy Backend First

### 1.1 Prepare Backend Environment Variables

Create these environment variables for your backend Vercel project:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_super_secure_jwt_secret_key_here
FRONTEND_URL=https://dt-vehicles-frontend.vercel.app
PORT=3000
```

### 1.2 Deploy Backend

#### Option A: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository
4. **Important**: Set **Root Directory** to `server`
5. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build` (or leave empty)
   - **Output Directory**: Leave empty
6. Add environment variables
7. Deploy

#### Option B: Vercel CLI
```bash
# From the /server directory
cd server
vercel
# Follow prompts, set project name as: dt-vehicles-backend
```

### 1.3 Test Backend
After deployment, test: `https://your-backend.vercel.app/api/health`

---

## Step 2: Deploy Frontend

### 2.1 Update Frontend Environment Variables

Update the frontend environment variables with your **actual backend URL**:

```env
REACT_APP_API_URL=https://your-actual-backend.vercel.app
REACT_APP_USE_STATIC_DATA=false
REACT_APP_NODE_ENV=production
```

### 2.2 Deploy Frontend

#### Option A: Vercel Dashboard
1. Create **another new project** in Vercel
2. Import the **same GitHub repository**
3. **Important**: Set **Root Directory** to `client`
4. Configure:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add environment variables
6. Deploy

#### Option B: Vercel CLI
```bash
# From the /client directory
cd client
vercel
# Follow prompts, set project name as: dt-vehicles-frontend
```

---

## Step 3: Update Cross-References

### 3.1 Update Backend CORS
After frontend deployment, update the backend's `FRONTEND_URL` environment variable:
```env
FRONTEND_URL=https://your-actual-frontend.vercel.app
```

### 3.2 Update Frontend API URL
If needed, update the frontend's `REACT_APP_API_URL`:
```env
REACT_APP_API_URL=https://your-actual-backend.vercel.app
```

---

## Environment Variables Reference

### Backend Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |
| `FRONTEND_URL` | Frontend domain for CORS | `https://dt-vehicles-frontend.vercel.app` |
| `PORT` | Server port | `3000` |

### Frontend Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://dt-vehicles-backend.vercel.app` |
| `REACT_APP_USE_STATIC_DATA` | Use mock data | `false` |
| `REACT_APP_NODE_ENV` | React environment | `production` |

---

## Quick Deployment Commands

### Deploy Backend
```bash
cd server
./deploy-backend.sh
vercel
```

### Deploy Frontend  
```bash
cd client
./deploy-frontend.sh
vercel
```

---

## Benefits of Separate Deployment

✅ **Independent Scaling**: Scale backend and frontend separately
✅ **Team Workflow**: Frontend and backend teams can deploy independently  
✅ **Performance**: Frontend served from CDN, backend optimized for API
✅ **Debugging**: Easier to isolate issues
✅ **Cost Optimization**: Pay only for what you use
✅ **Technology Flexibility**: Can easily switch frontend frameworks

---

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` is set correctly in backend
- Check that frontend URL is allowed in server CORS configuration

### API Connection Issues
- Verify `REACT_APP_API_URL` points to correct backend URL
- Test backend health endpoint: `/api/health`

### Build Failures
- Check Node.js version compatibility
- Ensure all dependencies are in `package.json`
- Review build logs in Vercel dashboard

---

## Monitoring

- **Backend Logs**: Vercel Dashboard → Functions tab
- **Frontend Logs**: Vercel Dashboard → Deployments tab  
- **Performance**: Enable Vercel Analytics
- **Errors**: Set up error tracking (Sentry, etc.)

---

## Production URLs Structure

```
Backend:  https://dt-vehicles-backend.vercel.app
Frontend: https://dt-vehicles-frontend.vercel.app
Database: MongoDB Atlas (separate service)
```
