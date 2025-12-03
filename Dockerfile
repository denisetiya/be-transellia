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

# Clean up devDependencies to reduce production image size (skip postinstall scripts)
RUN pnpm prune --prod --ignore-scripts

# Production stage
FROM node:18-alpine AS production

# Install OpenSSL and pnpm
RUN apk add --no-cache openssl && npm install -g pnpm

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml* ./

# Install production dependencies (skip postinstall scripts)
RUN if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile --prod --ignore-scripts; else pnpm install --prod --ignore-scripts; fi

# Copy generated Prisma client
COPY --from=base /app/src/generated ./src/generated

# Copy built application
COPY --from=base /app/dist ./dist

# Copy Prisma schema for potential migrations
COPY --from=base /app/prisma ./prisma

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/index.js"]