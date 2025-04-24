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
# These environment variables will be overridden by actual values at build time
# but are needed for the build process to complete
ENV VITE_CONVEX_URL=placeholder_will_be_set_at_runtime

# Run type checking and linting without Convex setup
RUN pnpm run lint:ci

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-slim as production

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Only copy what's needed for production
COPY --from=build /app/dist ./dist
COPY --from=build /app/convex ./convex
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-lock.yaml ./
COPY --from=build /app/index.html ./

# Install production dependencies only
RUN pnpm install --prod

# Install serve to serve the static files
RUN npm install -g serve convex

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Create a startup script that injects the Convex URL at runtime
RUN echo '#!/bin/sh\n\
if [ -z "$CONVEX_URL" ] && [ -z "$VITE_CONVEX_URL" ]; then\n\
  echo "Error: Neither CONVEX_URL nor VITE_CONVEX_URL environment variable is set"\n\
  echo "Please configure your Railway environment variables with your Convex deployment URL"\n\
  exit 1\n\
fi\n\
\n\
# Deploy Convex functions if we have a deploy key\n\
if [ -n "$CONVEX_DEPLOY_KEY" ]; then\n\
  echo "Deploying Convex functions..."\n\
  convex deploy\n\
fi\n\
\n\
# Replace placeholder URL in index.html\n\
CONVEX_URL_TO_USE=${CONVEX_URL:-$VITE_CONVEX_URL}\n\
if [ -f "./dist/index.html" ]; then\n\
  sed -i "s|placeholder_will_be_set_at_runtime|$CONVEX_URL_TO_USE|g" ./dist/index.html\n\
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