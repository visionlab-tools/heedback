# --- Build stage ---
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy monorepo structure for pnpm workspace resolution
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/api/package.json packages/api/

RUN pnpm install --frozen-lockfile --filter @heedback/api...

COPY packages/api/ packages/api/
RUN pnpm --filter @heedback/api build

# Deploy standalone production bundle (flattens workspace)
RUN pnpm deploy --filter @heedback/api --prod --legacy /deploy
COPY packages/api/database /deploy/database

# --- Production stage ---
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /deploy ./
COPY --from=builder /app/packages/api/build ./build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:3333/health || exit 1

# Run migrations then start server (--force to skip production confirmation prompt)
CMD ["sh", "-c", "node build/bin/console.js migration:run --force && node build/bin/server.js"]
