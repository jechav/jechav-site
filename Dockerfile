# ── builder ─────────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

# Copy root manifests
COPY package.json package-lock.json ./
# Provide workspace package.json stubs so npm ci resolves workspaces
COPY apps/prompts/package.json ./apps/prompts/package.json

RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

# ── runner ───────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
