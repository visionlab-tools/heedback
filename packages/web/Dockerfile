# --- Build stage ---
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy monorepo structure for pnpm workspace resolution
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json packages/shared/
COPY packages/ui-kit/package.json packages/ui-kit/
COPY packages/widget/package.json packages/widget/
COPY packages/web/package.json packages/web/

RUN pnpm install --frozen-lockfile --filter @heedback/web... --filter @heedback/widget...

# Build @heedback/shared first (workspace dependency)
COPY packages/shared/ packages/shared/
RUN pnpm --filter @heedback/shared build

COPY packages/ui-kit/ packages/ui-kit/
COPY packages/widget/ packages/widget/
RUN pnpm --filter @heedback/widget build

COPY packages/web/ packages/web/
RUN pnpm --filter @heedback/web build

# --- Production stage (nginx for SPA) ---
FROM nginx:alpine

COPY --from=builder /app/packages/web/build /usr/share/nginx/html
COPY --from=builder /app/packages/widget/dist/widget.iife.js /usr/share/nginx/html/widget.js
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY packages/web/docker-entrypoint.sh /docker-entrypoint.d/40-inject-env.sh
RUN chmod +x /docker-entrypoint.d/40-inject-env.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:80/ || exit 1
