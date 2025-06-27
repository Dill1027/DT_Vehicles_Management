# Deployment Guide for DT Vehicles Management

## Quick Deploy to Railway

1. **Create Railway account**: Go to [railway.app](https://railway.app) and sign up with GitHub

2. **Deploy backend**:
   - Click "New Project" → "Deploy from GitHub repo" 
   - Select this repository
   - Railway will automatically detect and build your Node.js app
   - Set these environment variables in Railway:
     ```
     NODE_ENV=production
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     PORT=5001
     CLIENT_URL=https://your-netlify-domain.netlify.app
     ```

3. **Get your Railway domain**: After deployment, you'll get a URL like `https://your-app-production.up.railway.app`

4. **Update Netlify environment**:
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://your-railway-domain.railway.app/api`
   - Trigger a new deploy

## Alternative: Deploy to Render

1. Go to [render.com](https://render.com)
2. Create "New Web Service"
3. Connect your GitHub repo
4. Set:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Environment Variables (same as above)

## Alternative: Deploy to Heroku

1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set NODE_ENV=production`
4. Deploy: `git push heroku main`

## Environment Variables Needed

```bash
# Required
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dt_vehicles
JWT_SECRET=your-super-secret-jwt-key
PORT=5001

# Optional
CLIENT_URL=https://your-netlify-domain.netlify.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Testing After Deployment

1. Test backend health: `https://your-backend-domain.com/api/health`
2. Create admin user: Use the admin creation script with the deployed URL
3. Test frontend login at your Netlify URL

## Troubleshooting

- **CORS errors**: Make sure `CLIENT_URL` environment variable is set correctly
- **Database connection**: Verify `MONGODB_URI` is correct
- **Authentication issues**: Check `JWT_SECRET` is set and consistent
- **API connection**: Verify `REACT_APP_API_URL` points to your deployed backend
