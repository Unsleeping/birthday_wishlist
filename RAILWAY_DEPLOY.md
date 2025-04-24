# Deploying to Railway

This document provides instructions for deploying your VITE React + Convex application to Railway.

## Prerequisites

1. A [Railway](https://railway.app/) account
2. A [Convex](https://www.convex.dev/) account with an existing deployment
3. Your Convex Deploy Key

## Setup in Railway

1. Create a new project in Railway and select "Deploy from GitHub"

2. Connect your GitHub repository

3. In the Railway project settings, add the following environment variables:

   - `CONVEX_DEPLOY_KEY`: Your Convex deploy key (find this in your Convex dashboard)
   - `CONVEX_URL`: Your Convex deployment URL (e.g., `https://bold-panda-123.convex.cloud`)
   - `NODE_ENV`: Set to `production`

4. Railway will automatically deploy your application using the Dockerfile in your repository

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
