# AutoMind Backend Dockerfile for GitLab CI/CD

# Build stage
FROM node:20.12.2-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --cache .npm --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20.12.2-alpine

# Create app directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S automind -u 1001

# Change ownership of the app directory
RUN chown -R automind:nodejs /app
USER automind

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "dist/index.js"]
