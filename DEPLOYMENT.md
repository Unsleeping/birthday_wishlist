# Vercel Deployment Guide

## 1. Deploy to Vercel

Follow the official Convex deployment guide: [Deploying to Vercel](https://docs.convex.dev/production/hosting/vercel)

## 2. Environment Variables Setup

### If built by Chef

Make sure to move these Convex environment variables from development to production:

```env
CONVEX_DEPLOY_KEY=     # Generate new Production Deploy Key in Convex dashboard
CONVEX_DEPLOYMENT=     # Will be set automatically by Vercel
VITE_CONVEX_URL=      # Will be set automatically by Vercel
```

### Additional Environment Variables

1. Copy ALL variables from your `.env.local` to Vercel's Environment Variables section
2. Make sure to mark any variables starting with `VITE_` or `NEXT_PUBLIC_` as "Public"
3. For reference, create a `.env.example` in your repository with all required variables

For more details about environment variables and deployment configuration, refer to the [official guide](https://docs.convex.dev/production/hosting/vercel).
