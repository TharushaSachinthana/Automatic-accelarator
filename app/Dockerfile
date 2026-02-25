# ============================================================================
# Multi-Stage Docker Build - Task Manager API
# ============================================================================
# Stage 1: Install dependencies (with dev deps for potential build steps)
# Stage 2: Production-ready minimal image
# ============================================================================

# --------------------------------------------------------------------------
# Stage 1: Dependencies
# --------------------------------------------------------------------------
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copy package files first (better Docker layer caching)
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# --------------------------------------------------------------------------
# Stage 2: Production Image
# --------------------------------------------------------------------------
FROM node:18-alpine AS production

# Security: Add labels for image metadata
LABEL maintainer="Tharusha Sachinthana"
LABEL description="Task Manager API - DevOps Pipeline Accelerator"
LABEL version="1.0.0"

# Security: Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=appuser:appgroup /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:appgroup package.json ./
COPY --chown=appuser:appgroup src/ ./src/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check for Docker and Kubernetes
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Security: Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "src/index.js"]
