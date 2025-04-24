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

# Build the app
RUN pnpm run lint
# This builds the client-side application
RUN pnpm run dev:frontend -- --build

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
ENV CONVEX_DEPLOYMENT=prod

# Expose port
EXPOSE 3000

# Start the application
CMD ["sh", "-c", "npx convex deploy --cmd 'serve -s dist -l $PORT'"]