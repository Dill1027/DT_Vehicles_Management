# Quick Backend Deployment Steps

## 🚀 Deploy Backend to Render (Free)

### 1. Go to Render
- Visit: https://render.com
- Sign up with GitHub

### 2. Create Web Service
- Click "New +" → "Web Service"
- Connect GitHub repo: `Dill1027/DT_Vehicles_Management`

### 3. Configure Service
```
Name: dt-vehicles-backend
Environment: Node
Root Directory: server
Build Command: npm install
Start Command: npm start
```

### 4. Set Environment Variables
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://prabhathdilshan2001:1234@as.gp7z1.mongodb.net/dt_petty_cash
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=https://dtvehicledetails.netlify.app
```

### 5. Deploy & Get URL
- Click "Create Web Service"
- Copy the deployed URL (e.g., `https://dt-vehicles-backend-xyz.onrender.com`)

### 6. Update Frontend
Replace the URL in `client/src/services/api.js` line 9:
```javascript
'https://your-actual-backend-url.onrender.com/api'
```

### 7. Redeploy Frontend
- Commit and push changes
- Netlify will auto-redeploy

## ✅ Result
- Frontend: https://dtvehicledetails.netlify.app
- Backend: https://your-backend-url.onrender.com
- Database: MongoDB Atlas
- Full CRUD operations working!
