FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm serve

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Expose port (Railway will override this)
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"] 