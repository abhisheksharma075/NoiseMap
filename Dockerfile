# ==============================================================================
# NoiseMap AI Copilot - Stage 2 Production Container
# Optimized for Agent 37 Cloud Sandbox / Custom Docker Workload
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install full dependencies for building the PWA
RUN npm ci

# Copy full application source
COPY . .

# Build frontend production bundle into /app/dist
RUN npm run build

# ------------------------------------------------------------------------------
# Production Runtime Stage
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy dependency manifests and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy server runtime and compiled frontend assets
COPY server/ ./server/
COPY --from=builder /app/dist ./dist

# Use non-root node user for container security
USER node

EXPOSE 3001

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Production server start
CMD ["node", "server/server.js"]
