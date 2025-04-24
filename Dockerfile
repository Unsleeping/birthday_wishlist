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
ENV CONVEX_DEPLOY_KEY=dummy_key_for_build
ENV CI=true

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
RUN npm install -g serve

# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Note: CONVEX_DEPLOYMENT and CONVEX_DEPLOY_KEY should be set in Railway environment variables
# not hardcoded in the Dockerfile

# Expose port
EXPOSE 3000

# Start the application (without convex deploy in the command)
CMD ["serve", "-s", "dist", "-l", "3000"]