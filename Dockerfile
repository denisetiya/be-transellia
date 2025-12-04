# Use Node.js 18 Alpine as base image
FROM node:18-alpine AS base

# Install OpenSSL and pnpm
RUN apk add --no-cache openssl && npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Copy Prisma schema first to avoid postinstall issues
COPY prisma ./prisma

# Install all dependencies (including devDependencies for build)
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; else pnpm install; fi

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN pnpm db:generate


# Build the application
RUN pnpm build

# Production stage
FROM node:18-alpine AS production

# Install OpenSSL and pnpm
RUN apk add --no-cache openssl && npm install -g pnpm

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy everything from base stage (including node_modules, dist, and generated prisma client)
COPY --from=base /app ./

# Copy the startup script
COPY scripts/start-with-migrations.sh /app/start-with-migrations.sh

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app

# Make the startup script executable
RUN chmod +x /app/start-with-migrations.sh

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with migrations
CMD ["/app/start-with-migrations.sh"]