# Vercel Deployment Guide for DT Vehicles Management

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **MongoDB Database**: Set up a MongoDB Atlas database (or similar cloud MongoDB)

## Step-by-Step Deployment

### 1. Prepare Environment Variables

Create these environment variables in your Vercel project settings:

#### For the Server (Backend):
```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://your-app.vercel.app
```

#### For the Client (Frontend):
```
REACT_APP_USE_STATIC_DATA=false
REACT_APP_NODE_ENV=production
REACT_APP_API_URL=https://your-app.vercel.app/api
REACT_APP_NAME=DT Vehicles Management
REACT_APP_VERSION=1.0.0
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (keep default)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/build`
5. Add your environment variables in the "Environment Variables" section
6. Click "Deploy"

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project root
vercel

# Follow the prompts and set up your project
```

### 3. Update Production URLs

After deployment, update these files with your actual Vercel URL:

1. Update `client/.env.production`:
   ```
   REACT_APP_API_URL=https://your-actual-app.vercel.app/api
   ```

2. Update server CORS configuration if needed
3. Set the `FRONTEND_URL` environment variable in Vercel to your actual domain

### 4. Database Setup

Make sure your MongoDB database:
- Allows connections from anywhere (0.0.0.0/0) or specifically from Vercel IPs
- Has the correct connection string in your `MONGODB_URI` environment variable
- Contains any required initial data

### 5. Post-Deployment Steps

1. **Test the API**: Visit `https://your-app.vercel.app/api/health`
2. **Test the Frontend**: Visit `https://your-app.vercel.app`
3. **Check Logs**: Use `vercel logs` or check the Vercel dashboard for any errors
4. **Monitor Performance**: Use Vercel Analytics to monitor your app

## Common Issues and Solutions

### 1. API Routes Not Working
- Ensure `vercel.json` is correctly configured
- Check that API routes start with `/api/`
- Verify environment variables are set correctly

### 2. CORS Errors
- Update the server's CORS configuration to include your Vercel domain
- Set the `FRONTEND_URL` environment variable correctly

### 3. Build Failures
- Check that all dependencies are in `package.json`
- Ensure build commands are correct
- Check Node.js version compatibility

### 4. Database Connection Issues
- Verify MongoDB connection string
- Check that database allows connections from Vercel
- Ensure all required environment variables are set

## Environment Variables Reference

### Server Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |
| `FRONTEND_URL` | Frontend domain | `https://your-app.vercel.app` |

### Client Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://your-app.vercel.app/api` |
| `REACT_APP_USE_STATIC_DATA` | Use mock data | `false` |
| `REACT_APP_NODE_ENV` | React environment | `production` |

## Monitoring and Maintenance

1. **Logs**: Check Vercel function logs for errors
2. **Analytics**: Monitor performance with Vercel Analytics
3. **Updates**: Use Git-based deployments for easy updates
4. **Rollbacks**: Use Vercel's rollback feature if needed

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
