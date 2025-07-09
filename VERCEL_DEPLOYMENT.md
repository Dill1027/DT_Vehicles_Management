# Deploying to Vercel

This project is set up for seamless deployment to Vercel, allowing you to host both the frontend and backend in a single platform.

## Prerequisites

1. [Vercel Account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/docs/cli) installed:
   ```bash
   npm install -g vercel
   ```
3. MongoDB Atlas account for database hosting

## Deployment Steps

1. **Login to Vercel CLI**:
   ```bash
   vercel login
   ```

2. **Configure Environment Variables**:
   Set up the following environment variables in the Vercel project:
   - `MONGODB_URI`: Your MongoDB connection string
   - Any other environment variables your project requires

3. **Deploy using the provided script**:
   ```bash
   ./deploy.sh
   ```
   
   Or manually:
   ```bash
   # Build the client
   cd client
   npm run build
   cd ..
   
   # Deploy to Vercel
   vercel --prod
   ```

4. **First-time deployment**:
   - The CLI will prompt you to link to an existing project or create a new one
   - Select "Create new project"
   - Set the project name as needed
   - Use the root directory (current directory) when prompted

## Vercel Configuration

The project includes a `vercel.json` file that configures:
- Build settings for both frontend and backend
- API routes to the serverless backend
- Static file serving for the React frontend

## Post-Deployment

After deployment, Vercel will provide you with a URL for your application. You can set up a custom domain in the Vercel dashboard if needed.

## Troubleshooting

- **API not responding**: Check if your MongoDB connection string is correctly set up in Vercel environment variables
- **Build errors**: Check the build logs in Vercel dashboard
- **CORS issues**: Ensure your API is properly configured to accept requests from your Vercel domain

For more detailed information, refer to the [Vercel documentation](https://vercel.com/docs).
