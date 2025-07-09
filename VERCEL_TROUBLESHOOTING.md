# Troubleshooting 500 Server Errors in Vercel Deployment

This guide will help you resolve the 500 Server Errors you're encountering with your DT Vehicles Management application deployed on Vercel.

## Step 1: Check the Vercel Function Logs

The most important step is to check the detailed error logs:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your backend project
3. Go to "Deployments" tab
4. Click on your latest deployment
5. Click on "Functions" to see your serverless functions
6. Click on a function that's failing (e.g., `/api/vehicles`)
7. Look for error messages in the logs

## Step 2: Check Your MongoDB Atlas Configuration

The most common cause of 500 errors is database connection issues:

1. **Verify Network Access**:
   - Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Go to "Network Access" under Security
   - Ensure `0.0.0.0/0` is in the allowed IP addresses list
   - If not, add it and click "Confirm"

2. **Check Database User**:
   - Go to "Database Access" under Security
   - Ensure your database user has "Read and Write to any database" permissions
   - If you need to create a new user, click "Add New Database User"

3. **Verify Database Exists**:
   - Go to "Clusters" and click on your cluster
   - Click "Collections" to view your databases
   - Make sure the database in your connection string exists
   - If not, you can create it by clicking "Create Database"

## Step 3: Update Environment Variables in Vercel

Set the correct environment variables in Vercel:

1. Go to your backend project in Vercel
2. Go to "Settings" > "Environment Variables"
3. Make sure these variables are set correctly:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   FRONTEND_URL=https://dt-vehicles-client.vercel.app
   NODE_ENV=production
   ```
4. Replace `<username>`, `<password>`, `<cluster>`, and `<database>` with actual values
5. Click "Save" to apply changes
6. Go to "Deployments" and click "Redeploy" on your latest deployment

## Step 4: Test Your Connection String

Test your MongoDB connection string to ensure it works:

1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Use your connection string to connect to your database
3. If Compass can connect, your string is valid
4. If not, troubleshoot the connection issues in Compass

## Step 5: Check for MongoDB Atlas Limitations

Free tier MongoDB Atlas has limitations that could cause issues:

1. **Connection Limits**: Limited to 100 concurrent connections
2. **Storage Limits**: 512 MB storage limit
3. **Performance**: Shared resources can cause slower responses

If you're hitting these limits, consider:
- Upgrading to a paid tier
- Optimizing your code to use fewer connections
- Implementing connection pooling

## Step 6: Specific API Error Troubleshooting

If specific API endpoints are failing:

1. **Vehicle Stats**: Check if your MongoDB aggregation queries are optimized
2. **Notifications**: Ensure the notification routes are properly implemented
3. **Vehicle List**: Verify that your Vehicle model is correctly defined

## Additional Resources

- [Vercel Serverless Functions Documentation](https://vercel.com/docs/serverless-functions/introduction)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

If you continue to experience issues, please share the specific error messages from the Vercel Function Logs for more targeted help.
