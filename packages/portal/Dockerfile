# --- Build stage ---
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy monorepo structure for pnpm workspace resolution
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY packages/portal/package.json packages/portal/

RUN pnpm install --frozen-lockfile --filter @heedback/portal...

# Build @heedback/shared first (workspace dependency)
COPY packages/shared/ packages/shared/
RUN pnpm --filter @heedback/shared build

COPY packages/portal/ packages/portal/
RUN pnpm --filter @heedback/portal build

# Deploy standalone production bundle (flattens workspace)
RUN pnpm deploy --filter @heedback/portal --prod /deploy

# --- Production stage ---
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /deploy ./
COPY --from=builder /app/packages/portal/build ./build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:3001/ || exit 1

CMD ["node", "build/index.js"]
