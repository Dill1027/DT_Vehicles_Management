# Fixing CORS Issues in DT Vehicles Management

This guide helps solve Cross-Origin Resource Sharing (CORS) issues in the DT Vehicles Management application deployment on Vercel.

## Current Problem

The client app deployed at `https://dt-vehicles-client-a0zmg9j7k-dill1027s-projects.vercel.app` is trying to access the backend API at `https://server-akucfqon0-dill1027s-projects.vercel.app/api/`, but is being blocked by CORS policies and returning 404 errors.

## Solutions Applied

1. **Updated Client Environment Variables:**
   - Updated `.env` and `.env.production` files with the correct backend URL
   - Updated `vercel.json` in the client project with the correct API URL

2. **Enhanced Server CORS Configuration:**
   - Modified CORS settings in `simpleServer.js` to explicitly allow the client domain
   - Added CORS preflight handling for all routes
   - Updated `vercel.json` in the server project to include CORS headers

## Deployment Steps

To properly deploy the changes:

1. **For the Server (Backend):**
   ```bash
   cd /Users/prabhath/Documents/GitHub/DT_Vehicles_Management/server
   git add .
   git commit -m "Update CORS settings to fix cross-origin issues"
   git push
   vercel --prod
   ```

2. **For the Client (Frontend):**
   ```bash
   cd /Users/prabhath/Documents/GitHub/DT_Vehicles_Management/client
   git add .
   git commit -m "Update environment variables to connect to backend"
   git push
   vercel --prod
   ```

## Verifying the Fix

After deployment, check your browser's console to ensure no more CORS errors appear. If issues persist:

1. Verify the backend is accessible directly:
   ```
   curl https://server-akucfqon0-dill1027s-projects.vercel.app/api/health
   ```

2. Check that the Vercel project settings match your `.env` and `vercel.json` files:
   - Go to the Vercel dashboard
   - Navigate to your project's settings
   - Confirm environment variables are set correctly

3. If still having issues, enable the Vercel development logs:
   ```
   vercel logs --follow
   ```

## Additional Notes

- Make sure the backend URL in `.env` and `vercel.json` always matches your actual deployed backend
- If you rename or redeploy the backend, update all references to its URL
- In development, the client's setupProxy.js handles CORS, but in production, we need proper CORS headers
