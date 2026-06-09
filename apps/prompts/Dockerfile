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
RUN apk add --no-cache libstdc++

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 astro

# Copy Astro standalone output and production node_modules (incl. native .node files)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

RUN chown -R astro:nodejs /app

USER astro
EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]

