# Deploy Backend to Vercel

## Quick Vercel Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy via Vercel Website (Recommended)

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project" 
   - Import your GitHub repo: `Dill1027/DT_Vehicles_Management`
   - Select the `server` directory as the root

3. **Configure Project**
   - Framework Preset: Other
   - Root Directory: `server`
   - Build Command: `npm install`
   - Output Directory: (leave empty)

4. **Set Environment Variables**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_petty_cash
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CLIENT_URL=https://dtvehicledetails.netlify.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Your backend URL: `https://your-project-name.vercel.app`

### 3. Alternative: CLI Deployment

From the server directory:
```bash
cd server
vercel --prod
```

### 4. Update Frontend

After deployment, update `client/src/services/api.js`:
```javascript
'https://your-actual-backend-url.vercel.app/api'
```

## Vercel Advantages

✅ **Fast deployment** (2-3 minutes)
✅ **Automatic HTTPS** 
✅ **Global CDN**
✅ **Serverless scaling**
✅ **Free tier** (sufficient for most apps)
✅ **GitHub integration** (auto-deploy on push)

## Test Your Deployment

After deployment, test these endpoints:
- `GET https://your-backend.vercel.app/api/vehicles`
- `GET https://your-backend.vercel.app/api/vehicles/stats`
