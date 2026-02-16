# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY packages/web/package.json packages/web/package-lock.json* ./
RUN npm ci

COPY packages/web/ ./
RUN npm run build

# --- Production stage (nginx for SPA) ---
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:3000/ || exit 1
