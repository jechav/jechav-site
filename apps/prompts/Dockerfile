# Build context is the repo root (see docker-compose.yml) so this image installs
# from the shared root package-lock.json, the same tree used in local dev.

# ── builder ─────────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

# Build deps for better-sqlite3 native addon
RUN apk add --no-cache python3 make g++

# Root manifest + lockfile and this workspace's manifest so npm ci resolves it
COPY package.json package-lock.json ./
COPY apps/prompts/package.json ./apps/prompts/package.json
RUN npm ci --workspace @jechav/prompts

COPY apps/prompts ./apps/prompts
RUN npm run build --workspace @jechav/prompts

# ── runner ───────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

# Need build tools to load the pre-compiled native addon on musl libc
RUN apk add --no-cache libstdc++ su-exec

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 astro

# Copy Astro standalone output and node_modules (incl. native .node files)
COPY --from=builder /app/apps/prompts/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY apps/prompts/docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh && \
    mkdir -p /app/data && \
    chown -R astro:nodejs /app
EXPOSE 4321

ENTRYPOINT ["/docker-entrypoint.sh"]
