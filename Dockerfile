FROM node:20-slim as build

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the rest of the source code
COPY . .

# Set environment for non-interactive Convex
ENV CI=true

# We'll skip the build here as we'll do it at runtime with the correct URL

# Production stage
FROM node:20-slim as production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy everything needed for the build
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-lock.yaml ./
COPY --from=build /app/tsconfig.json ./
COPY --from=build /app/tsconfig.app.json ./
COPY --from=build /app/tsconfig.node.json ./
COPY --from=build /app/vite.config.ts ./
COPY --from=build /app/index.html ./
COPY --from=build /app/tailwind.config.js ./
COPY --from=build /app/postcss.config.cjs ./
COPY --from=build /app/components.json ./
COPY --from=build /app/convex ./convex/
COPY --from=build /app/src ./src/

# Create public directory and copy content conditionally  
RUN mkdir -p ./public
# Use a script to conditionally copy public files if they exist
RUN echo '#!/bin/sh\n\
if [ -d "/app/public" ] && [ -n "$(ls -A /app/public 2>/dev/null)" ]; then\n\
  cp -r /app/public/* ./public/\n\
fi\n\
' > /tmp/copy_public.sh && chmod +x /tmp/copy_public.sh
COPY --from=build /app/public /app/public/
RUN /tmp/copy_public.sh || true

# Install dependencies
RUN pnpm install

# Install tools
RUN npm install -g serve convex

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Create a startup script to build with the correct Convex URL and then serve
RUN echo '#!/bin/sh\n\
if [ -z "$CONVEX_URL" ] && [ -z "$VITE_CONVEX_URL" ]; then\n\
  echo "Error: Neither CONVEX_URL nor VITE_CONVEX_URL environment variable is set"\n\
  echo "Please configure your Railway environment variables with your Convex deployment URL"\n\
  exit 1\n\
fi\n\
\n\
# Set the Convex URL for the build\n\
export VITE_CONVEX_URL=${VITE_CONVEX_URL:-$CONVEX_URL}\n\
\n\
echo "Building with Convex URL: $VITE_CONVEX_URL"\n\
\n\
# Build the application with the correct URL\n\
pnpm run build\n\
\n\
# Deploy Convex functions if we have a deploy key\n\
if [ -n "$CONVEX_DEPLOY_KEY" ]; then\n\
  echo "Deploying Convex functions..."\n\
  npx convex deploy\n\
fi\n\
\n\
# Start server\n\
echo "Starting server on port $PORT"\n\
exec serve -s dist -l $PORT\n\
' > /app/start.sh

RUN chmod +x /app/start.sh

# Expose port
EXPOSE 3000

# Use our startup script
CMD ["/app/start.sh"]