# 🚨 IMPORTANT: Set Environment Variables in Netlify Dashboard

The environment variables you added to the local `.env` file are not automatically deployed to Netlify. You need to set them in the Netlify dashboard.

## 🔧 How to Set Environment Variables:

1. **Go to the Netlify Dashboard:**
   https://app.netlify.com/projects/dtvehicle/settings/env-vars

2. **Add each variable:**
   - Click "New variable"
   - Add each of these:

```
NODE_ENV = production
MONGODB_URI = your-actual-mongodb-connection-string
JWT_SECRET = your-actual-jwt-secret-key
JWT_EXPIRES_IN = 24h
```

3. **After adding all variables:**
   - Click "Deploy site" or "Trigger deploy"
   - Wait for the deployment to complete

## 🧪 Test After Setting Variables:

```bash
# This should return database connection status
curl https://dtvehicle.netlify.app/api/health/db

# This should return vehicle data or empty array
curl https://dtvehicle.netlify.app/api/vehicles
```

## 🔄 Alternative: Manual Deploy

If you want to deploy right now with the environment variables, you can also:

1. Create a new deployment
2. Or wait for the CLI issue to resolve

**Note:** The local `.env` file is only for development. Production environment variables must be set in the Netlify dashboard.
