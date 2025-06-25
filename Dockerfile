# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies needed for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev dependencies for building)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl wget

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies first (we'll clean up later if needed)
RUN npm ci --legacy-peer-deps

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy and set permissions for entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Expose the port the app runs on
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/graphql || exit 1

# Command to run the application
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "start:prod"] 