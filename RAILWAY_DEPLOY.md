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
   - `VITE_CONVEX_URL`: Your Convex deployment URL (e.g., `https://bold-panda-123.convex.cloud`)

   **Note**: If you're using a custom domain with Convex (Pro plan required), you would set this to your custom domain URL instead.

4. Railway will automatically deploy your application using the Dockerfile in your repository

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
2. Your application is using the correct environment variable to initialize the Convex client

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
