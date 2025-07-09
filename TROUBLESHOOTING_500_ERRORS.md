# Troubleshooting 500 Server Errors on Vercel

If you're seeing 500 Server Errors when your frontend tries to connect to your backend API deployed on Vercel, follow this troubleshooting guide.

## Common Error Messages

- `Failed to load resource: the server responded with a status of 500 ()`
- `Error fetching vehicles: Request failed with status code 500`
- `Backend getAllVehicles failed, falling back to static data`

## Step 1: Check Database Connection

The most common cause of 500 errors is database connection issues.

1. **Verify MongoDB URL in Vercel Environment Variables**:
   - Go to your Vercel Dashboard
   - Select your backend project
   - Go to Settings > Environment Variables
   - Check that `MONGODB_URI` is correctly set to:
     ```
     mongodb://atlas-sql-686d124a38fca47bb3f5d833-jl0thv.a.query.mongodb.net/dt_vehicles_management?ssl=true&authSource=admin
     ```
   - Ensure you're using the correct database name (`dt_vehicles_management`)
   - **Important**: For MongoDB Atlas SQL connections, you need to add authentication credentials:
     - Set `MONGODB_USERNAME` and `MONGODB_PASSWORD` environment variables with your Atlas credentials
     - Alternatively, insert them directly in the connection string:
     ```
     mongodb://username:password@atlas-sql-686d124a38fca47bb3f5d833-jl0thv.a.query.mongodb.net/dt_vehicles_management?ssl=true&authSource=admin
     ```

2. **Check MongoDB Atlas Network Access**:
   - Log in to MongoDB Atlas
   - Go to Network Access
   - Make sure `0.0.0.0/0` is in the IP Access List to allow connections from anywhere

## Step 2: Check Vercel Logs

Vercel logs will show the exact error message from your serverless function:

1. Go to your Vercel Dashboard
2. Select your backend project
3. Go to "Deployments" and select your latest deployment
4. Click "Functions" and select the function that's failing (like `/api/vehicles`)
5. Look for error messages in the logs

## Step 3: Test MongoDB Connection Manually

If you're still having issues, try testing the MongoDB connection with our script:

```bash
# Run our test connection script
cd server
node testConnection.js
```

Or connect manually using the MongoDB shell:

```bash
# Install MongoDB CLI tools if needed
brew install mongodb-community-shell

# Connect to your MongoDB database
mongo "mongodb://atlas-sql-686d124a38fca47bb3f5d833-jl0thv.a.query.mongodb.net/dt_vehicles_management?ssl=true&authSource=admin"
```

If this fails, it may indicate an issue with the connection string or network access.

## Step 4: Check for Serverless Function Timeouts

Vercel serverless functions have execution time limits:

1. Go to Vercel Dashboard > Your Project > Settings > Functions
2. Check the "Maximum Execution Duration"
3. If your function is timing out, you may need to optimize your database connection or upgrade your Vercel plan

## Step 5: Redeploy After Making Changes

After making any changes:

1. Go to your Vercel Dashboard
2. Select your backend project
3. Go to "Deployments"
4. Click "Redeploy" on your latest deployment

## Step 6: Test the API Endpoints Directly

Test the API endpoints directly in your browser to see the specific error message:

1. Visit: `https://your-backend-url.vercel.app/api/health`
2. If this returns a 500 error, check the Vercel function logs for details

## Need More Help?

If you're still experiencing issues:

1. Check that your MongoDB URL format is correct
2. Verify that your MongoDB user has the correct permissions
3. Make sure the database name in the URL exists in your MongoDB cluster
4. Try creating a new database user in MongoDB Atlas

Remember, most 500 errors in this application are related to database connection issues. Once the database connection is working properly, the API should function correctly.
