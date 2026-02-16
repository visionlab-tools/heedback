# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY packages/portal/package.json packages/portal/package-lock.json* ./
RUN npm ci

COPY packages/portal/ ./
RUN npm run build

# --- Production stage ---
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:3001/ || exit 1

CMD ["node", "build/index.js"]
