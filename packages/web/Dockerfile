# --- Build stage ---
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy monorepo structure for pnpm workspace resolution
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY packages/ui-kit/package.json packages/ui-kit/
COPY packages/web/package.json packages/web/

RUN pnpm install --frozen-lockfile --filter @heedback/web...

# Build @heedback/shared first (workspace dependency)
COPY packages/shared/ packages/shared/
RUN pnpm --filter @heedback/shared build

COPY packages/ui-kit/ packages/ui-kit/
COPY packages/web/ packages/web/
RUN pnpm --filter @heedback/web build

# --- Production stage (nginx for SPA) ---
FROM nginx:alpine

COPY --from=builder /app/packages/web/build /usr/share/nginx/html
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:3000/ || exit 1
