# ── builder ─────────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

# Build deps for better-sqlite3 native addon
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

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

# Copy Astro standalone output and production node_modules (incl. native .node files)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh && \
    mkdir -p /app/data && \
    chown -R astro:nodejs /app
EXPOSE 4321

ENTRYPOINT ["/docker-entrypoint.sh"]
