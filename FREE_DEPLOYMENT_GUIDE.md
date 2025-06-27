# Free Backend Deployment Guide

## Option 1: Render.com (Recommended - Free)

### Steps:
1. **Go to [render.com](https://render.com)**
2. **Sign up** with GitHub (free)
3. **Click "New +"** → **"Web Service"**
4. **Connect your GitHub repo**: `DT_Vehicles_Management`
5. **Configure**:
   - **Name**: `dt-vehicles-backend`
   - **Runtime**: `Node`
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Plan**: `Free`

6. **Add Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_petty_cash
   JWT_SECRET=your-secret-key-minimum-32-chars
   CLIENT_URL=https://dtvehicledetails.netlify.app
   ```

7. **Deploy** - You'll get a URL like: `https://dt-vehicles-backend.onrender.com`

### Update Frontend:
Set in Netlify Environment Variables:
- **Key**: `REACT_APP_API_URL`
- **Value**: `https://dt-vehicles-backend.onrender.com/api`

---

## Option 2: Cyclic.sh (Alternative Free)

1. **Go to [cyclic.sh](https://cyclic.sh)**
2. **Sign up** with GitHub
3. **Deploy** from your repo
4. **Set environment variables** (same as above)

---

## Option 3: Vercel (Free)

1. **Go to [vercel.com](https://vercel.com)**
2. **Import** your GitHub repo
3. **Configure**:
   - **Framework**: `Other`
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Output Directory**: `.`

---

## Quick Fix: Remove Bad Environment Variable

If you have a placeholder URL set in Netlify:

1. **Go to Netlify Dashboard**
2. **Site Settings** → **Environment Variables**
3. **Delete** any `REACT_APP_API_URL` with placeholder value
4. **Redeploy** your site

## Test After Deployment

1. **Test backend health**: `https://your-backend-url.com/api/health`
2. **Create admin user**: Use your backend's admin creation script
3. **Test login**: On your Netlify frontend
