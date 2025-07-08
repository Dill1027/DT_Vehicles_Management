# Vercel Deployment Guide for DT Vehicles Management System

This guide will help you deploy your full-stack vehicle management application to Vercel.

## Overview

Your application consists of:
- **Frontend**: React app (client folder)
- **Backend**: Node.js API (server folder)

We'll deploy both components to Vercel as separate projects.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
   ```bash
   npm install -g vercel
   ```
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Deploy the Backend API

### 1.1 Prepare Backend for Deployment

Your backend is already configured with:
- ✅ `server/vercel.json` - Vercel configuration
- ✅ `server/api/index.js` - Serverless function entry point
- ✅ Proper package.json with dependencies

### 1.2 Environment Variables for Backend

Create these environment variables in Vercel dashboard:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=3001
```

### 1.3 Deploy Backend

From your project root:

```bash
cd server
vercel --prod
```

Or deploy via Vercel Dashboard:
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Set Root Directory to `server`
5. Add environment variables
6. Deploy

**Important**: Note the backend URL (e.g., `https://your-backend.vercel.app`)

## Step 2: Deploy the Frontend

### 2.1 Update API Configuration

Update your frontend API configuration to point to the deployed backend:

**File: `client/src/services/api.js`**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend.vercel.app';
```

### 2.2 Environment Variables for Frontend

Create these environment variables in Vercel dashboard:

```
REACT_APP_API_URL=https://your-backend.vercel.app
```

### 2.3 Deploy Frontend

From your project root:

```bash
cd client
vercel --prod
```

Or deploy via Vercel Dashboard:
1. Create a new project
2. Import your Git repository
3. Set Root Directory to `client`
4. Add environment variables
5. Deploy

## Step 3: Automated Deployment Setup

### 3.1 Root Level Vercel Configuration

Create a root-level `vercel.json` for monorepo deployment:

```json
{
  "version": 2,
  "projects": [
    {
      "name": "dt-vehicles-backend",
      "source": "server",
      "framework": null
    },
    {
      "name": "dt-vehicles-frontend",
      "source": "client",
      "framework": "create-react-app"
    }
  ]
}
```

### 3.2 GitHub Actions (Optional)

For automated deployment on git push, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Deploy Backend
        run: vercel --token=${{ secrets.VERCEL_TOKEN }} --prod --yes
        working-directory: ./server
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_BACKEND }}

  deploy-frontend:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - uses: actions/checkout@v2
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Deploy Frontend
        run: vercel --token=${{ secrets.VERCEL_TOKEN }} --prod --yes
        working-directory: ./client
        env:
          VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID_FRONTEND }}
```

## Step 4: Database Setup

### 4.1 MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Add database user
4. Configure network access (allow all IPs: 0.0.0.0/0 for Vercel)
5. Get connection string
6. Add to Vercel environment variables

### 4.2 Alternative: MongoDB Connection String

Format: `mongodb+srv://username:password@cluster.mongodb.net/database_name`

## Step 5: Domain Configuration

### 5.1 Custom Domain (Optional)

1. In Vercel dashboard, go to your frontend project
2. Go to Settings > Domains
3. Add your custom domain
4. Update DNS records as instructed

### 5.2 CORS Configuration

Ensure your backend allows requests from your frontend domain:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-frontend.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
};
```

## Step 6: Testing Deployment

### 6.1 Backend Testing

Test your API endpoints:
```bash
curl https://your-backend.vercel.app/api/vehicles
```

### 6.2 Frontend Testing

1. Visit your frontend URL
2. Test vehicle CRUD operations
3. Check browser console for errors
4. Verify API calls are working

## Troubleshooting

### Common Issues

1. **CORS Errors**: Update CORS configuration in backend
2. **API Not Found**: Check API_BASE_URL in frontend
3. **Database Connection**: Verify MongoDB connection string
4. **Environment Variables**: Ensure all required env vars are set
5. **Build Errors**: Check build logs in Vercel dashboard

### Debug Steps

1. Check Vercel function logs
2. Verify environment variables
3. Test API endpoints individually
4. Check network requests in browser DevTools

## Environment Variables Checklist

### Backend (.env)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
PORT=3001
```

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend.vercel.app
```

## Deployment Commands Summary

```bash
# Deploy backend
cd server
vercel --prod

# Deploy frontend
cd client
vercel --prod

# Or deploy both with custom names
vercel --prod --name dt-vehicles-backend
vercel --prod --name dt-vehicles-frontend
```

## Support

If you encounter issues:
1. Check Vercel documentation
2. Review deployment logs
3. Test locally first
4. Verify all configurations

Your vehicle management system should now be live and accessible worldwide! 🚀
