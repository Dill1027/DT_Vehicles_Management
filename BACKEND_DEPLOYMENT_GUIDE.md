# Deploy Backend to Render (Free Hosting)

## Step 1: Prepare Backend for Deployment

Your backend is ready for deployment! It includes:
- ✅ MongoDB Atlas connection string configured
- ✅ CORS configured for your Netlify domain
- ✅ All required environment variables in .env
- ✅ Production-ready server configuration

## Step 2: Deploy to Render (Recommended)

### Option A: Direct GitHub Integration (Easiest)

1. **Go to Render.com**
   - Visit https://render.com
   - Sign up with your GitHub account

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `https://github.com/Dill1027/DT_Vehicles_Management`
   - Choose the repository

3. **Configure the Service**
   ```
   Name: dt-vehicles-backend
   Environment: Node
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_petty_cash
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CLIENT_URL=https://dtvehicledetails.netlify.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (usually 2-5 minutes)
   - Your backend URL will be: `https://dt-vehicles-backend.onrender.com`

## Step 3: Update Frontend Configuration

After your backend is deployed, update your frontend to use the production API:

### Update Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site (dtvehicledetails)
3. Go to Site settings → Environment variables
4. Add:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com/api
   ```

### Alternative: Update api.js directly

If you don't want to use environment variables, update the API base URL:

```javascript
// In client/src/services/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 
                    (process.env.NODE_ENV === 'production' 
                      ? 'https://your-backend-url.onrender.com/api'
                      : 'http://localhost:5001/api');
```

## Step 4: Redeploy Frontend

After updating the API URL:
1. Commit your changes
2. Push to GitHub
3. Netlify will automatically redeploy

## Alternative: Railway Deployment

If Render doesn't work, try Railway:

1. Visit https://railway.app
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Choose the `server` folder as root
6. Set the same environment variables
7. Deploy

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your Netlify URL is in the CORS origins
2. **Database Connection**: Verify MongoDB URI is correct
3. **Environment Variables**: Ensure all required vars are set

### Test Your Backend

Once deployed, test these endpoints:
- `GET https://your-backend-url.onrender.com/api/vehicles`
- `GET https://your-backend-url.onrender.com/api/vehicles/stats`

## Free Tier Limitations

**Render Free Tier:**
- App goes to sleep after 15 minutes of inactivity
- Cold start takes 30-60 seconds
- 750 hours/month (sufficient for most use cases)

**Railway Free Tier:**
- $5 credit per month
- No sleep time
- Better performance

## Final Result

After deployment:
- ✅ Frontend: https://dtvehicledetails.netlify.app
- ✅ Backend: https://your-backend-url.onrender.com
- ✅ Database: MongoDB Atlas (already configured)
- ✅ Full CRUD operations working
- ✅ Real data saved to MongoDB
