# Deploying to Railway

This document provides instructions for deploying your VITE React + Convex application to Railway.

## Prerequisites

1. A [Railway](https://railway.app/) account
2. A [Convex](https://www.convex.dev/) account with an existing deployment
3. Your Convex Deploy Key (found in the Convex dashboard)

## Setup in Railway

1. Create a new project in Railway and select "Deploy from GitHub"

2. Connect your GitHub repository

3. In the Railway project settings, add the following environment variables:

   - `CONVEX_DEPLOY_KEY`: Your Convex deploy key (found in your Convex dashboard)
   - `VITE_CONVEX_URL`: Your Convex deployment URL (e.g., `https://kindhearted-bloodhound-963.convex.cloud`)

   **Important**: The Convex URL should be the complete URL including the `https://` prefix.

4. Railway will automatically deploy your application using the Dockerfile in your repository

## How It Works

The Dockerfile in this project:

1. Sets up a build environment for your application
2. Performs the build at container startup time with the correct Convex URL
3. Deploys the Convex functions (if a deploy key is provided)
4. Serves the built application

This approach ensures that the correct Convex URL is embedded in your JavaScript bundles at build time, avoiding the "No address provided to ConvexReactClient" error.

## Verifying Convex Client Initialization

Your application is properly configured to use the Convex URL from the environment variable in `src/main.tsx`:

```typescript
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
```

This code initializes the Convex client with the URL from the `VITE_CONVEX_URL` environment variable. Make sure this environment variable is set correctly in Railway.

## Convex Custom Domain Setup (Optional)

If you want to use a custom domain for your Convex backend (requires Convex Pro plan):

1. In the Convex dashboard, go to Project Settings
2. Add your custom domain (e.g., `api.example.com`)
3. Set up the DNS records as instructed in the Convex dashboard
4. In the Convex dashboard, override the system environment variable `CONVEX_CLOUD_URL` with your custom domain
5. Update your Railway environment variable to point to your custom domain:
   - `VITE_CONVEX_URL`: `https://api.example.com`

## Troubleshooting

### Convex URL Issues

If you see an error like:

```
Uncaught Error: No address provided to ConvexReactClient.
```

Make sure:

1. The `VITE_CONVEX_URL` is properly set in Railway
2. Check the Railway logs to ensure the build process sees the correct URL:
   - Look for "Building with Convex URL: [your URL]" in the logs
3. Verify your application correctly uses the environment variable to initialize the Convex client

### Convex Deployment Issues

If your Convex functions aren't being deployed:

1. Check that your `CONVEX_DEPLOY_KEY` is set correctly in Railway
2. Verify the key has the correct permissions in the Convex dashboard
3. Check Railway logs for any deployment errors

## Reference

For more information on Convex deployment options, see the [Convex Custom Domains & Hosting documentation](https://docs.convex.dev/production/hosting/custom)

## Deploying Convex Backend Separately

For a production setup, you have two options:

### Option 1: Deploy Convex from your local machine

1. Install the Convex CLI:

   ```
   npm install -g convex
   ```

2. Deploy your Convex functions:

   ```
   npx convex deploy
   ```

3. Update your Railway environment variable `CONVEX_URL` with the production URL

### Option 2: Add a pre-start script in Railway

Add a custom start command in your Railway settings to deploy Convex before starting the web server:

```
npx convex deploy && serve -s dist -l $PORT
```

## Important Notes

1. Make sure your frontend code is configured to use the Convex URL from environment variables
2. You may need to adjust CORS settings in your Convex project to allow requests from your Railway domain
3. Remember to set the appropriate environment variables in both your Railway and Convex dashboards
4. For larger projects, consider setting up separate deployments for your backend and frontend
